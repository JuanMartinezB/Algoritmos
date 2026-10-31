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

    public record SolicitudComparacion(
        List<Long> ids,
        String algoritmo // "todos", "levenshtein", "needleman", "jaccard", "tfidf"
    ) {}

    public record ParResultado(
        long idA,
        long idB,
        Double levenshtein,
        Double needlemanWunsch,
        Double jaccard,
        Double cosenoTfIdf,
        double tiempoLevenshteinMs,
        double tiempoNeedlemanMs,
        double tiempoJaccardMs,
        double tiempoTfIdfMs,
        double tiempoTotalMs
    ) {}

    public record ResultadoComparacion(
        List<ParResultado> pares,
        double tiempoTotalMs,
        double tiempoTotalLevenshteinMs,
        double tiempoTotalNeedlemanMs,
        double tiempoTotalJaccardMs,
        double tiempoTotalTfIdfMs,
        String algoritmoEjecutado
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
     * Recibe una lista de IDs de articulos (minimo 2) y opcionalmente el algoritmo deseado:
     * "todos", "levenshtein", "needleman", "jaccard", "tfidf".
     * Devuelve la similitud y mediciones detalladas de tiempo por cada algoritmo.
     */
    @PostMapping("/comparar")
    public ResultadoComparacion comparar(@RequestBody SolicitudComparacion solicitud) {
        List<Long> ids = solicitud.ids();
        if (ids == null || ids.size() < 2) {
            throw new IllegalArgumentException("Selecciona al menos dos artículos");
        }

        String modo = (solicitud.algoritmo() == null || solicitud.algoritmo().trim().isEmpty())
                ? "todos"
                : solicitud.algoritmo().trim().toLowerCase();

        boolean hacerLev = "todos".equals(modo) || "levenshtein".equals(modo);
        boolean hacerNw  = "todos".equals(modo) || "needleman".equals(modo);
        boolean hacerJac = "todos".equals(modo) || "jaccard".equals(modo);
        boolean hacerCos = "todos".equals(modo) || "tfidf".equals(modo);

        Levenshtein lev = hacerLev ? new Levenshtein() : null;
        NeedlemanWunsch nw = hacerNw ? new NeedlemanWunsch() : null;
        SimilitudJaccard jac = hacerJac ? new SimilitudJaccard() : null;
        SimilitudCosenoTfIdf cos = hacerCos ? cosenoTfIdf() : null;

        List<ParResultado> pares = new ArrayList<>();
        double acumuladoLev = 0;
        double acumuladoNw = 0;
        double acumuladoJac = 0;
        double acumuladoCos = 0;

        long inicioTotal = System.nanoTime();

        for (int i = 0; i < ids.size(); i++) {
            for (int j = i + 1; j < ids.size(); j++) {
                Articulo a = corpus.porId(ids.get(i));
                Articulo b = corpus.porId(ids.get(j));

                Double simLev = null;
                double tLev = 0.0;
                if (hacerLev) {
                    long t0 = System.nanoTime();
                    simLev = lev.similitud(a, b);
                    tLev = (System.nanoTime() - t0) / 1_000_000.0;
                    acumuladoLev += tLev;
                }

                Double simNw = null;
                double tNw = 0.0;
                if (hacerNw) {
                    long t0 = System.nanoTime();
                    simNw = nw.similitud(a, b);
                    tNw = (System.nanoTime() - t0) / 1_000_000.0;
                    acumuladoNw += tNw;
                }

                Double simJac = null;
                double tJac = 0.0;
                if (hacerJac) {
                    long t0 = System.nanoTime();
                    simJac = jac.similitud(a, b);
                    tJac = (System.nanoTime() - t0) / 1_000_000.0;
                    acumuladoJac += tJac;
                }

                Double simCos = null;
                double tCos = 0.0;
                if (hacerCos) {
                    long t0 = System.nanoTime();
                    simCos = cos.similitud(a, b);
                    tCos = (System.nanoTime() - t0) / 1_000_000.0;
                    acumuladoCos += tCos;
                }

                double tParTotal = tLev + tNw + tJac + tCos;

                pares.add(new ParResultado(
                    a.id(), b.id(),
                    simLev, simNw, simJac, simCos,
                    tLev, tNw, tJac, tCos,
                    tParTotal
                ));
            }
        }

        double tiempoTotal = (System.nanoTime() - inicioTotal) / 1_000_000.0;

        return new ResultadoComparacion(
            pares,
            tiempoTotal,
            acumuladoLev,
            acumuladoNw,
            acumuladoJac,
            acumuladoCos,
            modo
        );
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
