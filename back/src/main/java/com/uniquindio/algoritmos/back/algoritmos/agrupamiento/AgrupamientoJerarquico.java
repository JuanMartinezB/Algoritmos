package com.uniquindio.algoritmos.back.algoritmos.agrupamiento;

import java.util.ArrayList;
import java.util.List;

/**
 * Agrupamiento jerárquico aglomerativo implementado desde cero.
 *
 * Algoritmo:
 *   1. Cada abstract empieza como un cluster. D es la matriz de distancias.
 *   2. Repetir n − 1 veces:
 *        a. Buscar el par de clusters (i, j) con la menor distancia en D.
 *        b. Fusionarlos y registrar el paso (altura del dendrograma = esa distancia).
 *        c. Calcular la distancia del nuevo cluster (i ∪ j) a cada otro cluster k:
 *             SIMPLE   : d(k, i∪j) = min( d(k,i), d(k,j) )
 *             COMPLETO : d(k, i∪j) = max( d(k,i), d(k,j) )
 *             PROMEDIO : d(k, i∪j) = ( |i|·d(k,i) + |j|·d(k,j) ) / ( |i| + |j| )
 *
 * Complejidad: n−1 pasos, cada uno busca el mínimo en O(n²) → T(n) = O(n³) en tiempo, O(n²) en espacio.
 */
public final class AgrupamientoJerarquico {

    private AgrupamientoJerarquico() {
    }

    public static List<Fusion> agrupar(double[][] distancias, Enlace enlace) {
        int n = distancias.length;

        // Copia de trabajo: se modifica en cada fusión; la original no se altera
        double[][] d = new double[n][n];
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                d[i][j] = distancias[i][j];
            }
        }
        boolean[] activo = new boolean[n];
        int[] id = new int[n];
        int[] tamano = new int[n];
        for (int i = 0; i < n; i++) {
            activo[i] = true;
            id[i] = i;
            tamano[i] = 1;
        }

        List<Fusion> fusiones = new ArrayList<>();
        for (int paso = 0; paso < n - 1; paso++) {

            // a. Par de clusters activos más cercano (en empate gana el primero encontrado)
            int mi = -1;
            int mj = -1;
            double mejor = Double.MAX_VALUE;
            for (int i = 0; i < n; i++) {
                if (!activo[i]) {
                    continue;
                }
                for (int j = i + 1; j < n; j++) {
                    if (activo[j] && d[i][j] < mejor) {
                        mejor = d[i][j];
                        mi = i;
                        mj = j;
                    }
                }
            }

            // b. Registrar la fusión
            fusiones.add(new Fusion(id[mi], id[mj], mejor, tamano[mi] + tamano[mj]));

            // c. Actualizar distancias: el cluster nuevo ocupa la posición mi; mj se desactiva
            for (int k = 0; k < n; k++) {
                if (!activo[k] || k == mi || k == mj) {
                    continue;
                }
                double nueva;
                if (enlace == Enlace.SIMPLE) {
                    nueva = Math.min(d[k][mi], d[k][mj]);
                } else if (enlace == Enlace.COMPLETO) {
                    nueva = Math.max(d[k][mi], d[k][mj]);
                } else {
                    nueva = (tamano[mi] * d[k][mi] + tamano[mj] * d[k][mj]) / (tamano[mi] + tamano[mj]);
                }
                d[k][mi] = nueva;
                d[mi][k] = nueva;
            }
            activo[mj] = false;
            id[mi] = n + paso;
            tamano[mi] = tamano[mi] + tamano[mj];
        }
        return fusiones;
    }

    /**
     * Corta el dendrograma en k clusters: aplica solo las primeras n − k fusiones.
     * Retorna, para cada abstract, el número de su cluster (0..k−1).
     */
    public static int[] cortar(int n, List<Fusion> fusiones, int k) {
        List<List<Integer>> miembros = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            List<Integer> hoja = new ArrayList<>();
            hoja.add(i);
            miembros.add(hoja);
        }
        boolean[] consumido = new boolean[2 * n - 1];
        for (int paso = 0; paso < n - k; paso++) {
            Fusion f = fusiones.get(paso);
            List<Integer> union = new ArrayList<>(miembros.get(f.idA()));
            union.addAll(miembros.get(f.idB()));
            miembros.add(union);
            consumido[f.idA()] = true;
            consumido[f.idB()] = true;
        }
        int[] etiqueta = new int[n];
        int numero = 0;
        for (int c = 0; c < miembros.size(); c++) {
            if (!consumido[c]) {
                for (int hoja : miembros.get(c)) {
                    etiqueta[hoja] = numero;
                }
                numero++;
            }
        }
        return etiqueta;
    }
}
