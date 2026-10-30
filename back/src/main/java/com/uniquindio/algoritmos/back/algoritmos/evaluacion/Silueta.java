package com.uniquindio.algoritmos.back.algoritmos.evaluacion;

/**
 * Métrica de evaluación interna: coeficiente de silueta.
 *
 * Para cada abstract i:
 *     a(i) = distancia promedio de i a los demás de SU cluster        (cohesión)
 *     b(i) = menor distancia promedio de i a los abstracts de OTRO cluster (separación)
 *     s(i) = ( b(i) − a(i) ) / max( a(i), b(i) )      ∈ [−1, 1]
 * La silueta del agrupamiento es el promedio de s(i). Más cercano a 1 = clusters más coherentes.
 * Si el cluster de i tiene un solo elemento, s(i) = 0. Costo: O(n²).
 */
public final class Silueta {

    private Silueta() {
    }

    public static double calcular(double[][] dist, int[] etiqueta, int k) {
        int n = dist.length;
        double total = 0;
        for (int i = 0; i < n; i++) {
            double[] suma = new double[k];
            int[] cuenta = new int[k];
            for (int j = 0; j < n; j++) {
                if (j != i) {
                    suma[etiqueta[j]] += dist[i][j];
                    cuenta[etiqueta[j]]++;
                }
            }
            if (cuenta[etiqueta[i]] == 0) {
                continue; // cluster unitario: s(i) = 0
            }
            double a = suma[etiqueta[i]] / cuenta[etiqueta[i]];
            double b = Double.MAX_VALUE;
            for (int c = 0; c < k; c++) {
                if (c != etiqueta[i] && cuenta[c] > 0) {
                    b = Math.min(b, suma[c] / cuenta[c]);
                }
            }
            double mayor = Math.max(a, b);
            if (mayor > 0) {
                total += (b - a) / mayor;
            }
        }
        return total / n;
    }
}
