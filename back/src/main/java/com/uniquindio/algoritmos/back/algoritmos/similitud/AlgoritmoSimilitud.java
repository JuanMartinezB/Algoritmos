package com.uniquindio.algoritmos.back.algoritmos.similitud;

import com.uniquindio.algoritmos.back.modelo.Articulo;

/** Contrato comun de todos los algoritmos de similitud (clasicos y de IA). */
public interface AlgoritmoSimilitud {

    String getNombre();

    /** Similitud entre 0 y 1 (1 = textos iguales segun el algoritmo). */
    double similitud(Articulo a, Articulo b);
}