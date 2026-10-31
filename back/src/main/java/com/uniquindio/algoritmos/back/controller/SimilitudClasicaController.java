package com.uniquindio.algoritmos.back.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.uniquindio.algoritmos.back.algoritmos.similitud.clasicos.Levenshtein;
import com.uniquindio.algoritmos.back.algoritmos.similitud.clasicos.NeedlemanWunsch;
import com.uniquindio.algoritmos.back.algoritmos.similitud.clasicos.SimilitudCosenoTfIdf;
import com.uniquindio.algoritmos.back.algoritmos.similitud.clasicos.SimilitudJaccard;
import com.uniquindio.algoritmos.back.modelo.Articulo;
import com.uniquindio.algoritmos.back.util.CorpusJson;

/**
 * Endpoints REST para los 4 Algoritmos Clasicos de similitud.
 * Requerimiento 1 — Responsable: John.
 *
 * Base URL: /api/similitud/clasicos
 */
@RestController
@RequestMapping("/api/similitud/clasicos")
@CrossOrigin(origins = "*")
public class SimilitudClasicaController {

    // ---------- Records de entrada / salida ----------

    public record SolicitudComparacion(List<Long> ids) {}

    public record ParResultado(
        long idA,
        long idB,
        double levenshtein,
        double needlemanWunsch,
        double jaccard,
        double cosenoTfIdf,
        double tiempoMs
    ) {}

    public record ResultadoComparacion(
        List<ParResultado> pares,
        double tiempoTotalMs
    ) {}

    public record DetalleCompleto(
        long idA,
        long idB,
        // Levenshtein
        Levenshtein.DemostracionMatriz levenshtein,
        // Needleman-Wunsch
        NeedlemanWunsch.DemostracionMatriz needlemanWunsch,
        // Jaccard
        SimilitudJaccard.DetalleJaccard jaccard,
        // Coseno TF-IDF
        SimilitudCosenoTfIdf.DetalleTfIdf cosenoTfIdf
    ) {}

    // ---------- Dependencias ----------

    private final CorpusJson corpus;
    private SimilitudCosenoTfIdf cosenoTfIdf;

    public SimilitudClasicaController(CorpusJson corpus) {
        this.corpus = corpus;
    }

    /** El algoritmo TF-IDF necesita todo el corpus para el IDF, se inicializa una vez. */
    private synchronized SimilitudCosenoTfIdf cosenoTfIdf() {
        if (cosenoTfIdf == null) {
            cosenoTfIdf = new SimilitudCosenoTfIdf(corpus.articulos());
        }
        return cosenoTfIdf;
    }

    // ---------- Endpoints ----------

    /**
     * POST /api/similitud/clasicos/comparar
     * Recibe una lista de IDs de articulos (minimo 2).
     * Devuelve la similitud de cada par con los 4 algoritmos y los tiempos.
     */
    @PostMapping("/comparar")
    public ResultadoComparacion comparar(@RequestBody SolicitudComparacion solicitud) {
        List<Long> ids = solicitud.ids();
        if (ids == null || ids.size() < 2) {
            throw new IllegalArgumentException("Selecciona al menos dos artículos");
        }

        Levenshtein lev = new Levenshtein();
        NeedlemanWunsch nw = new NeedlemanWunsch();
        SimilitudJaccard jac = new SimilitudJaccard();
        SimilitudCosenoTfIdf cos = cosenoTfIdf();

        List<ParResultado> pares = new ArrayList<>();
        long inicioTotal = System.nanoTime();

        for (int i = 0; i < ids.size(); i++) {
            for (int j = i + 1; j < ids.size(); j++) {
                Articulo a = corpus.porId(ids.get(i));
                Articulo b = corpus.porId(ids.get(j));

                long inicioPar = System.nanoTime();

                double simLev = lev.similitud(a, b);
                double simNw  = nw.similitud(a, b);
                double simJac = jac.similitud(a, b);
                double simCos = cos.similitud(a, b);

                double tiempoPar = (System.nanoTime() - inicioPar) / 1_000_000.0;

                pares.add(new ParResultado(
                    a.id(), b.id(),
                    simLev, simNw, simJac, simCos,
                    tiempoPar
                ));
            }
        }

        double tiempoTotal = (System.nanoTime() - inicioTotal) / 1_000_000.0;
        return new ResultadoComparacion(pares, tiempoTotal);
    }

    /**
     * GET /api/similitud/clasicos/detalle?idA=1&idB=2
     * Devuelve el paso a paso de los 4 algoritmos para un par de articulos.
     */
    @GetMapping("/detalle")
    public DetalleCompleto detalle(
            @RequestParam long idA,
            @RequestParam long idB,
            @RequestParam(defaultValue = "30") int maxCaracteres) {

        Articulo a = corpus.porId(idA);
        Articulo b = corpus.porId(idB);

        Levenshtein lev = new Levenshtein();
        NeedlemanWunsch nw = new NeedlemanWunsch();
        SimilitudJaccard jac = new SimilitudJaccard();
        SimilitudCosenoTfIdf cos = cosenoTfIdf();

        return new DetalleCompleto(
            idA, idB,
            lev.generarDemostracion(a, b, maxCaracteres),
            nw.generarDemostracion(a, b, maxCaracteres),
            jac.generarDetalle(a, b),
            cos.generarDetalle(a, b)
        );
    }

    /**
     * GET /api/similitud/clasicos/algoritmos
     * Devuelve la lista de nombres de los 4 algoritmos implementados (util para el frontend).
     */
    @GetMapping("/algoritmos")
    public List<String> listarAlgoritmos() {
        return List.of(
            new Levenshtein().getNombre(),
            new NeedlemanWunsch().getNombre(),
            new SimilitudJaccard().getNombre(),
            new SimilitudCosenoTfIdf(corpus.articulos()).getNombre()
        );
    }
}
