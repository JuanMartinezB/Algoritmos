package com.uniquindio.algoritmos.back.algoritmos.agrupamiento;

/**
 * Un paso del agrupamiento: se unen los grupos idA e idB a la distancia indicada.
 * Los ids 0..n-1 son los abstracts; el grupo creado en el paso s tiene id n + s.
 */
public record Fusion(int idA, int idB, double distancia, int tamano) {
}
