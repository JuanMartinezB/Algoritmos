package com.uniquindio.algoritmos.back.algoritmos.busqueda;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/** Boyer-Moore con la regla del caracter malo. */
public class BoyerMoore {

    /** Preprocesamiento: ultima posicion de cada caracter en el patron (-1 si no esta). */
    public static int[] tablaCaracterMalo(String patron) {
        int[] tabla = new int[256];
        Arrays.fill(tabla, -1);
        for (int i = 0; i < patron.length(); i++) {
            tabla[patron.charAt(i) % 256] = i;
        }
        return tabla;
    }

    /** Devuelve las posiciones (indice inicial) donde aparece el patron en el texto. */
    public static List<Integer> buscar(String texto, String patron, int[] tabla) {
        List<Integer> posiciones = new ArrayList<>();
        int n = texto.length();
        int m = patron.length();
        int s = 0; // desplazamiento del patron sobre el texto

        while (s <= n - m) {
            int j = m - 1;
            // Comparar de derecha a izquierda
            while (j >= 0 && patron.charAt(j) == texto.charAt(s + j)) {
                j--;
            }
            if (j < 0) {
                posiciones.add(s);
                s++;
            } else {
                // Regla del caracter malo
                s += Math.max(1, j - tabla[texto.charAt(s + j) % 256]);
            }
        }
        return posiciones;
    }
}