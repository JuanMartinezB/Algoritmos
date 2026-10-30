package com.uniquindio.algoritmos.back.util;

/** Operaciones con vectores escritas a mano, sin librerias. */
public final class Vectores {

    private Vectores() {
    }

    /** A . B = suma de A[i] * B[i] */
    public static double productoPunto(double[] a, double[] b) {
        double suma = 0;
        for (int i = 0; i < a.length; i++) {
            suma += a[i] * b[i];
        }
        return suma;
    }

    /** |A| = raiz de (A . A) */
    public static double norma(double[] a) {
        return Math.sqrt(productoPunto(a, a));
    }

    /** cos(A, B) = (A . B) / (|A| * |B|). Si un vector es todo ceros devuelve 0. */
    public static double coseno(double[] a, double[] b) {
        double normas = norma(a) * norma(b);
        return normas == 0 ? 0 : productoPunto(a, b) / normas;
    }

    /** Suma de (A[i] - B[i])^2 */
    public static double sumaDiferenciasCuadradas(double[] a, double[] b) {
        double suma = 0;
        for (int i = 0; i < a.length; i++) {
            suma += (a[i] - b[i]) * (a[i] - b[i]);
        }
        return suma;
    }

    /** d(A, B) = raiz de la suma de (A[i] - B[i])^2 */
    public static double distanciaEuclidiana(double[] a, double[] b) {
        return Math.sqrt(sumaDiferenciasCuadradas(a, b));
    }
}