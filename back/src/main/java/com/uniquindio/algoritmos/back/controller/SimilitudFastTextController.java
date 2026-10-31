package com.uniquindio.algoritmos.back.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.uniquindio.algoritmos.back.algoritmos.similitud.ia.fasttext.ModeloFastText;
import com.uniquindio.algoritmos.back.algoritmos.similitud.ia.fasttext.SimilitudFastText;
import com.uniquindio.algoritmos.back.modelo.Articulo;
import com.uniquindio.algoritmos.back.util.CorpusJson;

/** Endpoints del algoritmo FastText (Requerimiento 1, modelos de IA). */
@RestController
@RequestMapping("/api/similitud/fasttext")
@CrossOrigin(origins = "*")
public class SimilitudFastTextController {

    public record SolicitudComparacion(List<Long> ids) {
    }

    /** Resultado de un par; tiempoMs es lo que tardo en calcularse (vectores + las tres metricas). */
    public record Par(long idA, long idB, double coseno, double distancia, double similitudEuclidiana,
                      double tiempoMs) {
    }

    /** tiempoTotalMs: todo el calculo de la comparacion. tiempoCargaModeloMs: lo que tardo en cargar el modelo. */
    public record ResultadoComparacion(List<Par> pares, double tiempoTotalMs, double tiempoCargaModeloMs) {
    }

    private final CorpusJson corpus;
    private SimilitudFastText fastText;
    private double tiempoCargaMs;

    @Value("${fasttext.vec-completo:../datos/Fasttext/wiki-news-300d-1M.vec}")
    private String vecCompleto;

    @Value("${fasttext.vec-filtrado:../datos/Fasttext/vectores-corpus.vec}")
    private String vecFiltrado;

    public SimilitudFastTextController(CorpusJson corpus) {
        this.corpus = corpus;
    }

    /**
     * Resuelve la ruta del archivo de vectores completo wiki-news-300d-1M.vec,
     * probando rutas relativas tanto si se ejecuta desde /back como desde la raíz.
     */
    private Path resolverVecCompleto() {
        for (String candidata : new String[]{
                vecCompleto,
                "../datos/Fasttext/wiki-news-300d-1M.vec",
                "datos/Fasttext/wiki-news-300d-1M.vec",
                "../datos/fasttext/wiki-news-300d-1M.vec",
                "datos/fasttext/wiki-news-300d-1M.vec",
                "../datos/wiki-news-300d-1M.vec",
                "datos/wiki-news-300d-1M.vec"}) {
            if (candidata != null && !candidata.isBlank()) {
                Path p = Path.of(candidata).toAbsolutePath().normalize();
                if (Files.exists(p)) {
                    return p;
                }
            }
        }
        return Path.of(vecCompleto).toAbsolutePath().normalize();
    }

    /**
     * Resuelve la ruta del archivo filtrado de vectores.
     */
    private Path resolverVecFiltrado() {
        Path rutaCompleto = resolverVecCompleto();
        if (Files.exists(rutaCompleto)) {
            // Guardar el filtrado en la misma carpeta del archivo completo o en datos/fasttext
            return rutaCompleto.getParent().resolve("vectores-corpus.vec").normalize();
        }
        for (String candidata : new String[]{
                vecFiltrado,
                "../datos/Fasttext/vectores-corpus.vec",
                "datos/Fasttext/vectores-corpus.vec",
                "../datos/fasttext/vectores-corpus.vec",
                "datos/fasttext/vectores-corpus.vec",
                "../datos/vectores-corpus.vec",
                "datos/vectores-corpus.vec"}) {
            if (candidata != null && !candidata.isBlank()) {
                return Path.of(candidata).toAbsolutePath().normalize();
            }
        }
        return Path.of(vecFiltrado).toAbsolutePath().normalize();
    }

    /** El modelo se carga la primera vez que se necesita. */
    private synchronized SimilitudFastText fastText() throws IOException {
        if (fastText == null) {
            Path rutaCompleto = resolverVecCompleto();
            Path rutaFiltrado = resolverVecFiltrado();
            long inicio = System.nanoTime();
            fastText = new SimilitudFastText(
                    new ModeloFastText(rutaCompleto, rutaFiltrado, corpus.vocabulario()));
            tiempoCargaMs = (System.nanoTime() - inicio) / 1_000_000.0;   // ns a ms
        }
        return fastText;
    }

    /** Compara cada par de articulos seleccionados. Cuerpo: {"ids": [1, 2, 3]} */
    @PostMapping("/comparar")
    public ResultadoComparacion comparar(@RequestBody SolicitudComparacion solicitud) throws IOException {
        List<Long> ids = solicitud.ids();
        if (ids == null || ids.size() < 2) {
            throw new IllegalArgumentException("Selecciona al menos dos articulos");
        }
        SimilitudFastText ft = fastText();   // el modelo se carga ANTES de medir el tiempo del algoritmo
        List<Par> pares = new ArrayList<>();
        long inicioTotal = System.nanoTime();
        for (int i = 0; i < ids.size(); i++) {
            for (int j = i + 1; j < ids.size(); j++) {
                Articulo a = corpus.porId(ids.get(i));
                Articulo b = corpus.porId(ids.get(j));
                long inicioPar = System.nanoTime();
                double coseno = ft.similitud(a, b);
                double distancia = ft.distancia(a, b);
                double similitudEuclidiana = ft.similitudEuclidiana(a, b);
                double tiempoPar = (System.nanoTime() - inicioPar) / 1_000_000.0;   // ns a ms
                pares.add(new Par(a.id(), b.id(), coseno, distancia, similitudEuclidiana, tiempoPar));
            }
        }
        double tiempoTotal = (System.nanoTime() - inicioTotal) / 1_000_000.0;
        return new ResultadoComparacion(pares, tiempoTotal, tiempoCargaMs);
    }

    /** Calculo paso a paso entre dos abstracts: vectores, producto punto, normas, etc. */
    @GetMapping("/detalle")
    public SimilitudFastText.Detalle detalle(@RequestParam long idA, @RequestParam long idB)
            throws IOException {
        return fastText().detalle(corpus.porId(idA), corpus.porId(idB));
    }

    /** Por cada abstract, las palabras que FastText no conoce. */
    @GetMapping("/cobertura")
    public Map<Long, List<String>> cobertura() throws IOException {
        SimilitudFastText ft = fastText();
        Map<Long, List<String>> faltantes = new LinkedHashMap<>();
        for (Articulo articulo : corpus.articulos()) {
            long id = articulo.id();
            faltantes.put(id, ft.noEncontradas(articulo));
        }
        return faltantes;
    }

}