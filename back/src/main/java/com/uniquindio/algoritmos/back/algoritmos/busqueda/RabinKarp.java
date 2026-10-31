package com.uniquindio.algoritmos.back.algoritmos.busqueda;

import java.util.ArrayList;
import java.util.List;

/** Rabin-Karp con rolling hash y aritmetica modular. */
public class RabinKarp {

    public static final int BASE = 256; // tamano del alfabeto
    public static final int MOD = 101;  // primo pequeno (se ven colisiones; sube a 1_000_003 para menos)

    /** Hash de una cadena: h = (h * BASE + caracter) % MOD */
    public static long hash(String s) {
        long h = 0;
        for (int i = 0; i < s.length(); i++) {
            h = (h * BASE + s.charAt(i)) % MOD;
        }
        return h;
    }

    /** Preprocesamiento: BASE^(m-1) % MOD, el peso del primer caracter de la ventana. O(m) */
    public static long potencia(int m) {
        long potencia = 1;
        for (int i = 0; i < m - 1; i++) {
            potencia = (potencia * BASE) % MOD;
        }
        return potencia;
    }

    /** Devuelve las posiciones (indice inicial) donde aparece el patron en el texto. */
    public static List<Integer> buscar(String texto, String patron, long hashPatron, long potencia) {
        List<Integer> posiciones = new ArrayList<>();
        int n = texto.length();
        int m = patron.length();
        if (m > n) {
            return posiciones;
        }

        long hashVentana = hash(texto.substring(0, m));

        for (int s = 0; s <= n - m; s++) {
            // Si los hash coinciden, verificar caracter a caracter (puede ser colision)
            if (hashVentana == hashPatron && coincide(texto, patron, s)) {
                posiciones.add(s);
            }
            // Rolling hash: quitar texto[s] y agregar texto[s + m]
            if (s < n - m) {
                hashVentana = ((hashVentana - texto.charAt(s) * potencia) * BASE + texto.charAt(s + m)) % MOD;
                if (hashVentana < 0) {
                    hashVentana += MOD;
                }
            }
        }
        return posiciones;
    }

    private static boolean coincide(String texto, String patron, int s) {
        for (int j = 0; j < patron.length(); j++) {
            if (texto.charAt(s + j) != patron.charAt(j)) {
                return false;
            }
        }
        return true;
    }
}