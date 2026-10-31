package com.uniquindio.algoritmos.back.algoritmos.busqueda;

import java.util.List;

@FunctionalInterface
public interface Buscador {
    List<Integer> buscar(String texto);
}