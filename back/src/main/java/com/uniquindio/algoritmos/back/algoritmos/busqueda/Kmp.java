package com.uniquindio.algoritmos.back.algoritmos.busqueda;

import java.util.ArrayList;
import java.util.List;

public class Kmp {

    /** Preprocesamiento: tabla[i] = largo del prefijo mas largo que tambien es sufijo de patron[0..i]. O(m) */
    public static int[] tablaPrefijos(String patron) {
        int[] tabla = new int[patron.length()];
        int k = 0;
        for (int i = 1; i < patron.length(); i++) {
            while (k > 0 && patron.charAt(i) != patron.charAt(k)) {
                k = tabla[k - 1];
            }
            if (patron.charAt(i) == patron.charAt(k)) {
                k++;
            }
            tabla[i] = k;
        }
        return tabla;
    }

    /** Busqueda: devuelve las posiciones donde empieza cada coincidencia. O(n) */
    public static List<Integer> buscar(String texto, String patron, int[] tabla) {
        List<Integer> posiciones = new ArrayList<>();
        int k = 0;
        for (int i = 0; i < texto.length(); i++) {
            while (k > 0 && texto.charAt(i) != patron.charAt(k)) {
                k = tabla[k - 1];
            }
            if (texto.charAt(i) == patron.charAt(k)) {
                k++;
            }
            if (k == patron.length()) {
                posiciones.add(i - k + 1);
                k = tabla[k - 1];
            }
        }
        return posiciones;
    }
}