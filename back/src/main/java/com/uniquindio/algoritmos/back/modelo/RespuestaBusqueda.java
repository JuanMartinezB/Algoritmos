package com.uniquindio.algoritmos.back.modelo;

import java.util.List;

public record RespuestaBusqueda(
        String algoritmo,
        String patron,
        int[] tablaPrefijos,
        long tiempoPreprocesamientoNs,
        long tiempoBusquedaNs,
        int totalOcurrencias,
        List<ResultadoArticulo> resultados) {

        public record ResultadoArticulo(
            int id,
            String titulo,
            String autores,
            String resumen,
            int ocurrencias,
            List<Integer> posiciones) {
    }
}