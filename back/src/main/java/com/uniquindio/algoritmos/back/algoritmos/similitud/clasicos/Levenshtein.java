package com.uniquindio.algoritmos.back.algoritmos.similitud.clasicos;

import com.uniquindio.algoritmos.back.algoritmos.similitud.AlgoritmoSimilitud;
import com.uniquindio.algoritmos.back.modelo.Articulo;

/**
 * Algoritmo clasico de Distancia de Edicion de Levenshtein (Programacion Dinamica).
 * 
 * Mide el numero minimo de operaciones elementales (insercion, eliminacion, sustitucion)
 * requeridas para transformar una cadena de texto en otra.
 * 
 * Complejidad temporal: O(N * M)
 * Complejidad espacial: O(N * M)
 */
public class Levenshtein implements AlgoritmoSimilitud {

    @Override
    public String getNombre() {
        return "Levenshtein (Programación Dinámica)";
    }

    /**
     * Calcula la distancia minima de edicion entre dos cadenas de caracteres
     * mediante la construccion iterativa de la matriz DP.
     */
    public int calcularDistancia(String s1, String s2) {
        if (s1 == null) s1 = "";
        if (s2 == null) s2 = "";

        int n = s1.length();
        int m = s2.length();

        if (n == 0) return m;
        if (m == 0) return n;

        int[][] dp = new int[n + 1][m + 1];

        // Inicializacion de casos base (transformar prefijo a cadena vacia)
        for (int i = 0; i <= n; i++) {
            dp[i][0] = i;
        }
        for (int j = 0; j <= m; j++) {
            dp[0][j] = j;
        }

        // Llenado de la matriz aplicando el principio de optimalidad
        for (int i = 1; i <= n; i++) {
            char c1 = s1.charAt(i - 1);
            for (int j = 1; j <= m; j++) {
                char c2 = s2.charAt(j - 1);
                int costoSustitucion = (c1 == c2) ? 0 : 1;

                dp[i][j] = Math.min(
                    dp[i - 1][j] + 1,                       // Eliminacion
                    Math.min(
                        dp[i][j - 1] + 1,                   // Insercion
                        dp[i - 1][j - 1] + costoSustitucion // Sustitucion / Coincidencia
                    )
                );
            }
        }

        return dp[n][m];
    }

    /**
     * Similitud normalizada en el rango [0.0, 1.0].
     * Formula: 1.0 - (distancia / max(longitud_a, longitud_b))
     */
    @Override
    public double similitud(Articulo a, Articulo b) {
        String textoA = a.resumenProcesado();
        String textoB = b.resumenProcesado();

        int maxLen = Math.max(textoA.length(), textoB.length());
        if (maxLen == 0) return 1.0;

        int distancia = calcularDistancia(textoA, textoB);
        return Math.max(0.0, 1.0 - ((double) distancia / maxLen));
    }

    /**
     * Record para exportar una submatriz didactica con fines de sustentacion y explicacion visual.
     */
    public record DemostracionMatriz(
        String textoFila,
        String textoColumna,
        char[] caracteresFila,
        char[] caracteresColumna,
        int[][] matriz,
        int distanciaTotal,
        double similitudCalculada
    ) {}

    /**
     * Genera una demostracion paso a paso con una muestra de texto representativa
     * para ilustrar visualmente el llenado de la matriz DP en el frontend y en la sustentacion.
     */
    public DemostracionMatriz generarDemostracion(Articulo a, Articulo b, int maxLongitud) {
        String s1 = a.resumenProcesado();
        String s2 = b.resumenProcesado();

        int distanciaReal = calcularDistancia(s1, s2);
        double simReal = similitud(a, b);

        // Tomar una muestra acotada de caracteres para visualizacion tabular clara
        String sub1 = s1.length() > maxLongitud ? s1.substring(0, maxLongitud) : s1;
        String sub2 = s2.length() > maxLongitud ? s2.substring(0, maxLongitud) : s2;

        int n = sub1.length();
        int m = sub2.length();
        int[][] dp = new int[n + 1][m + 1];

        for (int i = 0; i <= n; i++) dp[i][0] = i;
        for (int j = 0; j <= m; j++) dp[0][j] = j;

        for (int i = 1; i <= n; i++) {
            char c1 = sub1.charAt(i - 1);
            for (int j = 1; j <= m; j++) {
                char c2 = sub2.charAt(j - 1);
                int costo = (c1 == c2) ? 0 : 1;
                dp[i][j] = Math.min(
                    dp[i - 1][j] + 1,
                    Math.min(dp[i][j - 1] + 1, dp[i - 1][j - 1] + costo)
                );
            }
        }

        return new DemostracionMatriz(
            sub1,
            sub2,
            sub1.toCharArray(),
            sub2.toCharArray(),
            dp,
            distanciaReal,
            simReal
        );
    }
}
