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

import com.uniquindio.algoritmos.back.algoritmos.similitud.ia.glove.ModeloGlove;
import com.uniquindio.algoritmos.back.algoritmos.similitud.ia.glove.SimilitudGlove;
import com.uniquindio.algoritmos.back.modelo.Articulo;
import com.uniquindio.algoritmos.back.util.CorpusJson;

/** Endpoints del algoritmo GloVe (Requerimiento 1, modelos de IA). */
@RestController
@RequestMapping("/api/similitud/glove")
@CrossOrigin(origins = "*")
public class SimilitudGloveController {

    public record SolicitudComparacion(List<Long> ids) {
    }

    public record Par(long idA, long idB, double coseno, double distancia, double similitudEuclidiana) {
    }

    private final CorpusJson corpus;
    private SimilitudGlove glove;

    @Value("${glove.vec-completo:../datos/glove/glove.6B.50d.txt}")
    private String vecCompleto;

    @Value("${glove.vec-filtrado:../datos/glove/vectores-glove-corpus.vec}")
    private String vecFiltrado;

    public SimilitudGloveController(CorpusJson corpus) {
        this.corpus = corpus;
    }

    /**
     * Busca el archivo con la ruta configurada (relativa a back/) y, si no existe,
     * sin el "../" (por si se ejecuta desde la raiz del proyecto).
     */
    private Path resolver(String configurada) {
        for (String candidata : new String[]{configurada, configurada.replace("../", "")}) {
            Path p = Path.of(candidata).toAbsolutePath().normalize();
            if (Files.exists(p)) {
                return p;
            }
        }
        return Path.of(configurada).toAbsolutePath().normalize();
    }

    /** El modelo se carga la primera vez que se necesita. */
    private synchronized SimilitudGlove glove() throws IOException {
        if (glove == null) {
            ModeloGlove modelo = new ModeloGlove(resolver(vecCompleto), resolver(vecFiltrado), corpus.vocabulario());
            glove = new SimilitudGlove(modelo, corpus.articulos());
        }
        return glove;
    }

    /** Compara cada par de articulos seleccionados. Cuerpo: {"ids": [1, 2, 3]} */
    @PostMapping("/comparar")
    public List<Par> comparar(@RequestBody SolicitudComparacion solicitud) throws IOException {
        List<Long> ids = solicitud.ids();
        if (ids == null || ids.size() < 2) {
            throw new IllegalArgumentException("Selecciona al menos dos articulos");
        }
        SimilitudGlove gl = glove();
        List<Par> pares = new ArrayList<>();
        for (int i = 0; i < ids.size(); i++) {
            for (int j = i + 1; j < ids.size(); j++) {
                Articulo a = corpus.porId(ids.get(i));
                Articulo b = corpus.porId(ids.get(j));
                pares.add(new Par(a.id(), b.id(), gl.similitud(a, b),
                        gl.distancia(a, b), gl.similitudEuclidiana(a, b)));
            }
        }
        return pares;
    }

    /** Calculo paso a paso entre dos abstracts: vectores, producto punto, normas, etc. */
    @GetMapping("/detalle")
    public SimilitudGlove.Detalle detalle(@RequestParam long idA, @RequestParam long idB)
            throws IOException {
        return glove().detalle(corpus.porId(idA), corpus.porId(idB));
    }

    /** Por cada abstract, las palabras que GloVe no conoce. */
    @GetMapping("/cobertura")
    public Map<Long, List<String>> cobertura() throws IOException {
        SimilitudGlove gl = glove();
        Map<Long, List<String>> faltantes = new LinkedHashMap<>();
        for (Articulo articulo : corpus.articulos()) {
            long id = articulo.id();
            faltantes.put(id, gl.noEncontradas(articulo));
        }
        return faltantes;
    }

}
