package com.uniquindio.algoritmos.back.algoritmos.similitud.clasicos;

import com.uniquindio.algoritmos.back.algoritmos.similitud.AlgoritmoSimilitud;
import com.uniquindio.algoritmos.back.modelo.Articulo;

/**
 * Algoritmo de alineamiento global Needleman-Wunsch (Programacion Dinamica).
 *
 * Originalmente diseñado para alinear secuencias biologicas, se aplica aqui
 * para medir la similitud entre textos de articulos academicos comparando
 * caracter a caracter con un sistema de puntuacion configurable.
 *
 * Complejidad temporal: O(N * M)
 * Complejidad espacial: O(N * M)
 */
public class NeedlemanWunsch implements AlgoritmoSimilitud {

    private final int match;
    private final int mismatch;
    private final int gap;

    /** Valores por defecto: +1 coincidencia, -1 diferencia, -1 hueco. */
    public NeedlemanWunsch() {
        this(1, -1, -1);
    }

    public NeedlemanWunsch(int match, int mismatch, int gap) {
        this.match = match;
        this.mismatch = mismatch;
        this.gap = gap;
    }

    @Override
    public String getNombre() {
        return "Needleman-Wunsch (Programación Dinámica)";
    }

    /**
     * Calcula el puntaje optimo de alineamiento global entre dos cadenas.
     */
    public int calcularPuntaje(String s1, String s2) {
        if (s1 == null) s1 = "";
        if (s2 == null) s2 = "";

        int n = s1.length();
        int m = s2.length();

        int[][] dp = new int[n + 1][m + 1];

        // Inicializacion: penalizaciones por gaps al inicio
        for (int i = 0; i <= n; i++) {
            dp[i][0] = i * gap;
        }
        for (int j = 0; j <= m; j++) {
            dp[0][j] = j * gap;
        }

        // Llenado de la matriz buscando el maximo en cada celda
        for (int i = 1; i <= n; i++) {
            char c1 = s1.charAt(i - 1);
            for (int j = 1; j <= m; j++) {
                char c2 = s2.charAt(j - 1);
                int puntajeDiag = dp[i - 1][j - 1] + (c1 == c2 ? match : mismatch);
                int puntajeArr  = dp[i - 1][j] + gap;
                int puntajeIzq  = dp[i][j - 1] + gap;

                dp[i][j] = Math.max(puntajeDiag, Math.max(puntajeArr, puntajeIzq));
            }
        }

        return dp[n][m];
    }

    /**
     * Similitud normalizada en [0.0, 1.0].
     * Se calcula como: (puntajeObtenido - puntajeMinimo) / (puntajeMaximo - puntajeMinimo)
     */
    @Override
    public double similitud(Articulo a, Articulo b) {
        String textoA = a.resumenProcesado();
        String textoB = b.resumenProcesado();

        int maxLen = Math.max(textoA.length(), textoB.length());
        if (maxLen == 0) return 1.0;

        int puntaje = calcularPuntaje(textoA, textoB);

        // Puntaje maximo posible: todos los caracteres coinciden (longitud mayor * match)
        int puntajeMax = maxLen * match;

        // Puntaje minimo posible: todos los caracteres son gap o mismatch
        int puntajeMin = maxLen * Math.min(gap, mismatch);

        if (puntajeMax == puntajeMin) return 1.0;

        return Math.max(0.0, Math.min(1.0,
                (double) (puntaje - puntajeMin) / (puntajeMax - puntajeMin)));
    }

    /**
     * Record para exportar la demostracion paso a paso al frontend.
     */
    public record DemostracionMatriz(
        String textoFila,
        String textoColumna,
        char[] caracteresFila,
        char[] caracteresColumna,
        int[][] matriz,
        int puntajeTotal,
        double similitudCalculada,
        int matchVal,
        int mismatchVal,
        int gapVal
    ) {}

    /**
     * Genera la demostracion visual con una muestra acotada de los textos.
     */
    public DemostracionMatriz generarDemostracion(Articulo a, Articulo b, int maxLongitud) {
        String s1 = a.resumenProcesado();
        String s2 = b.resumenProcesado();

        int puntajeReal = calcularPuntaje(s1, s2);
        double simReal = similitud(a, b);

        String sub1 = s1.length() > maxLongitud ? s1.substring(0, maxLongitud) : s1;
        String sub2 = s2.length() > maxLongitud ? s2.substring(0, maxLongitud) : s2;

        int n = sub1.length();
        int m = sub2.length();
        int[][] dp = new int[n + 1][m + 1];

        for (int i = 0; i <= n; i++) dp[i][0] = i * gap;
        for (int j = 0; j <= m; j++) dp[0][j] = j * gap;

        for (int i = 1; i <= n; i++) {
            char c1 = sub1.charAt(i - 1);
            for (int j = 1; j <= m; j++) {
                char c2 = sub2.charAt(j - 1);
                int diag = dp[i - 1][j - 1] + (c1 == c2 ? match : mismatch);
                int arr  = dp[i - 1][j] + gap;
                int izq  = dp[i][j - 1] + gap;
                dp[i][j] = Math.max(diag, Math.max(arr, izq));
            }
        }

        return new DemostracionMatriz(
            sub1, sub2,
            sub1.toCharArray(), sub2.toCharArray(),
            dp, puntajeReal, simReal,
            match, mismatch, gap
        );
    }
}
