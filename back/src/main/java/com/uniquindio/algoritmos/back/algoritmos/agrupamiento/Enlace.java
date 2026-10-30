package com.uniquindio.algoritmos.back.algoritmos.agrupamiento;

/** Criterio de enlace: define como se mide la distancia entre dos grupos de abstracts. */
public enum Enlace {
    /** Distancia entre grupos = la MENOR distancia entre un elemento de cada grupo. */
    SIMPLE,
    /** Distancia entre grupos = la MAYOR distancia entre un elemento de cada grupo. */
    COMPLETO,
    /** Distancia entre grupos = PROMEDIO de las distancias entre sus elementos (UPGMA). */
    PROMEDIO
}
