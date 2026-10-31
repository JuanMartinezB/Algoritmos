package com.uniquindio.algoritmos.back.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.uniquindio.algoritmos.back.algoritmos.agrupamiento.AgrupamientoJerarquico;
import com.uniquindio.algoritmos.back.algoritmos.agrupamiento.Dendrograma;
import com.uniquindio.algoritmos.back.algoritmos.agrupamiento.Enlace;
import com.uniquindio.algoritmos.back.algoritmos.agrupamiento.Fusion;
import com.uniquindio.algoritmos.back.algoritmos.evaluacion.Silueta;
import com.uniquindio.algoritmos.back.algoritmos.similitud.AlgoritmoSimilitud;
import com.uniquindio.algoritmos.back.algoritmos.similitud.ia.fasttext.ModeloFastText;
import com.uniquindio.algoritmos.back.algoritmos.similitud.ia.fasttext.SimilitudFastText;
import com.uniquindio.algoritmos.back.algoritmos.similitud.ia.glove.ModeloGlove;
import com.uniquindio.algoritmos.back.algoritmos.similitud.ia.glove.SimilitudGlove;
import com.uniquindio.algoritmos.back.modelo.Articulo;
import com.uniquindio.algoritmos.back.util.CorpusJson;

/**
 * Requerimiento 2: agrupamiento jerarquico de los abstracts.
 * Pasos: similitud entre todos los pares -> distancia = 1 - similitud -> clustering (3 enlaces)
 * -> silueta para evaluar -> dendrograma (SVG) de cada enlace.
 */
@RestController
@RequestMapping("/api/agrupamiento")
@CrossOrigin(origins = "*")
public class AgrupamientoController {

    /** Silueta se calcula para k = 2 .. K_MAXIMO grupos. */
    private static final int K_MAXIMO = 10;

    public record Criterio(String nombre, List<Fusion> fusiones, Map<Integer, Double> silueta,
                           int mejorK, double siluetaMejorK, double siluetaPromedio, double siluetaEnK, int[] grupos, String svg) {
    }

    public record Resultado(String algoritmo, int k, List<String> etiquetas, double[][] distancias,
                            List<Criterio> criterios, String masCoherente) {
    }

    private final CorpusJson corpus;
    private final Map<String, double[][]> distanciasPorAlgoritmo = new HashMap<>();

    @Value("${glove.vec-completo:../datos/glove/glove.6B.50d.txt}")
    private String gloveCompleto;

    @Value("${glove.vec-filtrado:../datos/glove/vectores-glove-corpus.vec}")
    private String gloveFiltrado;

    @Value("${fasttext.vec-completo:../datos/Fasttext/wiki-news-300d-1M.vec}")
    private String fasttextCompleto;

    @Value("${fasttext.vec-filtrado:../datos/Fasttext/vectores-corpus.vec}")
    private String fasttextFiltrado;

    public AgrupamientoController(CorpusJson corpus) {
        this.corpus = corpus;
    }

    /**
     * GET /api/agrupamiento/resultado?algoritmo=glove&k=3
     * algoritmo: "glove" (rapido) o "fasttext" (la primera vez carga el modelo y puede tardar).
     * k: numero de grupos en que se corta el dendrograma (2 .. 19).
     */
    @GetMapping("/resultado")
    public Resultado resultado(@RequestParam(defaultValue = "glove") String algoritmo,
                               @RequestParam(defaultValue = "3") int k) throws IOException {
        List<Articulo> articulos = corpus.articulos();
        int n = articulos.size();
        if (k < 2 || k > n - 1) {
            throw new IllegalArgumentException("k debe estar entre 2 y " + (n - 1));
        }
        double[][] distancias = distancias(algoritmo.toLowerCase(), articulos);

        String[] etiquetas = new String[n];
        for (int i = 0; i < n; i++) {
            etiquetas[i] = articulos.get(i).id() + " " + articulos.get(i).autoresCorto();
        }

        List<Criterio> criterios = new ArrayList<>();
        for (Enlace enlace : Enlace.values()) {
            criterios.add(evaluar(enlace, distancias, etiquetas, k));
        }

        // El mas coherente es el de mayor silueta (con su mejor k). Si empatan, gana el de mayor
        // silueta promedio sobre todos los k (asi no depende de un solo corte).
        Criterio mejor = criterios.get(0);
        for (Criterio c : criterios) {
            double diferencia = c.siluetaMejorK() - mejor.siluetaMejorK();
            if (diferencia > 1e-9 || (Math.abs(diferencia) <= 1e-9 && c.siluetaPromedio() > mejor.siluetaPromedio())) {
                mejor = c;
            }
        }
        return new Resultado(algoritmo, k, List.of(etiquetas), distancias, criterios, mejor.nombre());
    }

    /** Ejecuta un enlace: clustering, silueta para cada k y dendrograma. */
    private Criterio evaluar(Enlace enlace, double[][] distancias, String[] etiquetas, int k) {
        int n = distancias.length;
        List<Fusion> fusiones = AgrupamientoJerarquico.agrupar(distancias, enlace);

        Map<Integer, Double> silueta = new LinkedHashMap<>();
        int mejorK = 2;
        for (int kk = 2; kk <= Math.min(K_MAXIMO, n - 1); kk++) {
            int[] grupos = AgrupamientoJerarquico.cortar(n, fusiones, kk);
            silueta.put(kk, Silueta.calcular(distancias, grupos, kk));
            if (silueta.get(kk) > silueta.get(mejorK)) {
                mejorK = kk;
            }
        }
        double suma = 0;
        for (double valor : silueta.values()) {
            suma += valor;
        }
        double promedio = suma / silueta.size();
        int[] gruposK = AgrupamientoJerarquico.cortar(n, fusiones, k);
        double siluetaK = Silueta.calcular(distancias, gruposK, k);
        String nombre = switch (enlace) {
            case SIMPLE -> "Single Linkage";
            case COMPLETO -> "Complete Linkage";
            case PROMEDIO -> "Average Linkage";
        };
        String svg = Dendrograma.aSvg(n, fusiones, etiquetas, "Dendrograma - " + nombre, k);
        return new Criterio(nombre, fusiones, silueta, mejorK, silueta.get(mejorK), promedio, siluetaK, gruposK, svg);
    }

    /** Matriz de distancias d = 1 - similitud (se guarda para no recalcularla). */
    private synchronized double[][] distancias(String algoritmo, List<Articulo> articulos) throws IOException {
        double[][] guardada = distanciasPorAlgoritmo.get(algoritmo);
        if (guardada != null) {
            return guardada;
        }
        AlgoritmoSimilitud similitud = crearSimilitud(algoritmo, articulos);
        int n = articulos.size();
        double[][] d = new double[n][n];
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                double distancia = 1 - similitud.similitud(articulos.get(i), articulos.get(j));
                d[i][j] = distancia;
                d[j][i] = distancia;
            }
        }
        distanciasPorAlgoritmo.put(algoritmo, d);
        return d;
    }

    private AlgoritmoSimilitud crearSimilitud(String algoritmo, List<Articulo> articulos) throws IOException {
        if (algoritmo.equals("glove")) {
            ModeloGlove modelo = new ModeloGlove(resolver(gloveCompleto), resolver(gloveFiltrado), corpus.vocabulario());
            return new SimilitudGlove(modelo, articulos);
        }
        if (algoritmo.equals("fasttext")) {
            Path completo = resolverFastText();
            // El filtrado se guarda junto al archivo completo (igual que en el controller de FastText)
            Path filtrado = Files.exists(completo)
                    ? completo.getParent().resolve("vectores-corpus.vec").normalize()
                    : resolver(fasttextFiltrado);
            ModeloFastText modelo = new ModeloFastText(completo, filtrado, corpus.vocabulario());
            return new SimilitudFastText(modelo);
        }
        throw new IllegalArgumentException("Algoritmo de similitud no soportado: " + algoritmo);
    }

    /** Busca wiki-news-300d-1M.vec en las ubicaciones habituales (con o sin carpeta fasttext, desde back/ o desde la raiz). */
    private Path resolverFastText() {
        for (String candidata : new String[]{
                fasttextCompleto,
                "../datos/Fasttext/wiki-news-300d-1M.vec",
                "datos/Fasttext/wiki-news-300d-1M.vec",
                "../datos/wiki-news-300d-1M.vec",
                "datos/wiki-news-300d-1M.vec",
                "../datos/fasttext/wiki-news-300d-1M.vec",
                "datos/fasttext/wiki-news-300d-1M.vec"}) {
            Path p = Path.of(candidata).toAbsolutePath().normalize();
            if (Files.exists(p)) {
                return p;
            }
        }
        return Path.of(fasttextCompleto).toAbsolutePath().normalize();
    }

    /** Busca el archivo con la ruta configurada y, si no existe, sin el "../" (ejecucion desde la raiz). */
    private Path resolver(String configurada) {
        for (String candidata : new String[]{configurada, configurada.replace("../", "")}) {
            Path p = Path.of(candidata).toAbsolutePath().normalize();
            if (Files.exists(p)) {
                return p;
            }
        }
        return Path.of(configurada).toAbsolutePath().normalize();
    }
}
