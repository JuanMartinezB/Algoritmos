package com.uniquindio.algoritmos.back.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.uniquindio.algoritmos.back.algoritmos.busqueda.Kmp;
import com.uniquindio.algoritmos.back.modelo.Articulo;
import com.uniquindio.algoritmos.back.modelo.RespuestaBusqueda;
import com.uniquindio.algoritmos.back.modelo.RespuestaBusqueda.ResultadoArticulo;
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
        if (patron.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El patron no puede estar vacio");
        }
        String patronMin = patron.toLowerCase();

        // Preprocesamiento (una sola vez, depende solo del patron)
        long inicio = System.nanoTime();
        int[] tabla = Kmp.tablaPrefijos(patronMin);
        long tiempoPre = System.nanoTime() - inicio;

        // Busqueda en el resumen original de cada articulo
        List<ResultadoArticulo> resultados = new ArrayList<>();
        long tiempoBusqueda = 0;
        int total = 0;

        for (Articulo a : corpus.articulos()) {
            String texto = a.resumenOriginal().toLowerCase();

            inicio = System.nanoTime();
            List<Integer> posiciones = Kmp.buscar(texto, patronMin, tabla);
            tiempoBusqueda += System.nanoTime() - inicio;

            if (!posiciones.isEmpty()) {
                total += posiciones.size();
                resultados.add(new ResultadoArticulo(
                a.id(), a.titulo(), a.autores(), a.resumenOriginal(), posiciones.size(), posiciones));
            }
        }

        return new RespuestaBusqueda("KMP", patron, tabla, tiempoPre, tiempoBusqueda, total, resultados);
    }
}
