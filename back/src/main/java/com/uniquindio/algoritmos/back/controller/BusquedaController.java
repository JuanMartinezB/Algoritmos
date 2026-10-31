package com.uniquindio.algoritmos.back.controller;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.uniquindio.algoritmos.back.algoritmos.busqueda.BoyerMoore;
import com.uniquindio.algoritmos.back.algoritmos.busqueda.Buscador;
import com.uniquindio.algoritmos.back.algoritmos.busqueda.ComparadorBusqueda;
import com.uniquindio.algoritmos.back.algoritmos.busqueda.Kmp;
import com.uniquindio.algoritmos.back.algoritmos.busqueda.RabinKarp;
import com.uniquindio.algoritmos.back.modelo.Articulo;
import com.uniquindio.algoritmos.back.modelo.RespuestaBusqueda;
import com.uniquindio.algoritmos.back.modelo.RespuestaBusqueda.ResultadoArticulo;
import com.uniquindio.algoritmos.back.modelo.RespuestaComparacion;
import com.uniquindio.algoritmos.back.util.CorpusJson;

@RestController
@RequestMapping("/api/busqueda")
@CrossOrigin(origins = "*")
public class BusquedaController {

    private final CorpusJson corpus;

    public BusquedaController(CorpusJson corpus) {
        this.corpus = corpus;
    }

    @GetMapping("/kmp")
    public RespuestaBusqueda kmp(@RequestParam String patron) {
        String p = normalizar(patron);

        long inicio = System.nanoTime();
        int[] tabla = Kmp.tablaPrefijos(p);
        long tiempoPre = System.nanoTime() - inicio;

        Barrido b = recorrerCorpus(texto -> Kmp.buscar(texto, p, tabla));
        return new RespuestaBusqueda("KMP", patron, tabla, null,
                tiempoPre, b.tiempoNs(), b.total(), b.resultados());
    }

    @GetMapping("/boyer-moore")
    public RespuestaBusqueda boyerMoore(@RequestParam String patron) {
        String p = normalizar(patron);

        long inicio = System.nanoTime();
        int[] tabla = BoyerMoore.tablaCaracterMalo(p);
        long tiempoPre = System.nanoTime() - inicio;

        // Para mostrar: ultima posicion de cada caracter del patron (la tabla completa tiene 256 entradas)
        Map<String, Object> auxiliar = new LinkedHashMap<>();
        for (char c : p.toCharArray()) {
            auxiliar.put(String.valueOf(c), tabla[c % 256]);
        }

        Barrido b = recorrerCorpus(texto -> BoyerMoore.buscar(texto, p, tabla));
        return new RespuestaBusqueda("Boyer-Moore", patron, null, auxiliar,
                tiempoPre, b.tiempoNs(), b.total(), b.resultados());
    }

    @GetMapping("/rabin-karp")
    public RespuestaBusqueda rabinKarp(@RequestParam String patron) {
        String p = normalizar(patron);

        long inicio = System.nanoTime();
        long hash = RabinKarp.hash(p);
        long potencia = RabinKarp.potencia(p.length());
        long tiempoPre = System.nanoTime() - inicio;

        Map<String, Object> auxiliar = new LinkedHashMap<>();
        auxiliar.put("hashPatron", hash);
        auxiliar.put("base", RabinKarp.BASE);
        auxiliar.put("modulo", RabinKarp.MOD);
        auxiliar.put("potencia", potencia);

        Barrido b = recorrerCorpus(texto -> RabinKarp.buscar(texto, p, hash, potencia));
        return new RespuestaBusqueda("Rabin-Karp", patron, null, auxiliar,
                tiempoPre, b.tiempoNs(), b.total(), b.resultados());
    }

    /** Compara los 3 algoritmos: varias repeticiones, calentamiento y distintos tamanos de texto. */
    @GetMapping("/comparar")
    public RespuestaComparacion comparar(
            @RequestParam String patron,
            @RequestParam(defaultValue = "1000") int repeticiones,
            @RequestParam(defaultValue = "200") int calentamiento) {
        String p = normalizar(patron);
        if (repeticiones < 1 || repeticiones > 10000 || calentamiento < 0 || calentamiento > 2000) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "repeticiones debe estar entre 1 y 10000, y calentamiento entre 0 y 2000");
        }

        List<String> textos = new ArrayList<>();
        for (Articulo a : corpus.articulos()) {
            textos.add(a.resumenOriginal().toLowerCase());
        }
        return ComparadorBusqueda.comparar(p, textos, repeticiones, calentamiento);
    }

    // ---------- auxiliares ----------

    private record Barrido(long tiempoNs, int total, List<ResultadoArticulo> resultados) {
    }

    /** Valida el patron y lo pasa a minusculas (la busqueda es insensible a mayusculas). */
    private String normalizar(String patron) {
        if (patron.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El patron no puede estar vacio");
        }
        return patron.toLowerCase();
    }

    /** Busca en el resumen original de cada articulo y acumula el tiempo solo de la busqueda. */
    private Barrido recorrerCorpus(Buscador buscador) {
        List<ResultadoArticulo> resultados = new ArrayList<>();
        long tiempo = 0;
        int total = 0;

        for (Articulo a : corpus.articulos()) {
            String texto = a.resumenOriginal().toLowerCase();

            long inicio = System.nanoTime();
            List<Integer> posiciones = buscador.buscar(texto);
            tiempo += System.nanoTime() - inicio;

            if (!posiciones.isEmpty()) {
                total += posiciones.size();
                resultados.add(new ResultadoArticulo(
                        a.id(), a.titulo(), a.autores(), a.resumenOriginal(), posiciones.size(), posiciones));
            }
        }
        return new Barrido(tiempo, total, resultados);
    }
}