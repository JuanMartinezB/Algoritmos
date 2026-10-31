package com.uniquindio.algoritmos.back.modelo;

import java.util.List;
import java.util.Map;

public record RespuestaBusqueda(
        String algoritmo,
        String patron,
        int[] tablaPrefijos,                    // solo KMP (null en los demas)
        Map<String, Object> estructuraAuxiliar, // solo Boyer-Moore y Rabin-Karp (null en KMP)
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