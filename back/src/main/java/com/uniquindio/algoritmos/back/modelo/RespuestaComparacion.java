package com.uniquindio.algoritmos.back.modelo;

import java.util.List;

public record RespuestaComparacion(
        String patron,
        int repeticiones,
        int calentamiento,
        List<Escala> escalas) {

    /** Resultados para un subconjunto del corpus (los primeros N articulos). */
    public record Escala(
            int articulos,
            int caracteres,           // n: tamano total del texto
            int ocurrencias,
            boolean resultadosIguales, // true si los 3 algoritmos encontraron lo mismo
            List<Medicion> algoritmos) {
    }

    public record Medicion(
            String algoritmo,
            long preprocesamientoMedianaNs,
            long busquedaMedianaNs,
            long preprocesamientoPromedioNs,
            long busquedaPromedioNs) {
    }
}