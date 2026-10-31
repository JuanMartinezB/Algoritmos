package com.uniquindio.algoritmos.back.algoritmos.busqueda;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;
import java.util.function.Function;

import com.uniquindio.algoritmos.back.modelo.RespuestaComparacion;
import com.uniquindio.algoritmos.back.modelo.RespuestaComparacion.Escala;
import com.uniquindio.algoritmos.back.modelo.RespuestaComparacion.Medicion;

public class ComparadorBusqueda {

    /** Un algoritmo = su nombre + como se prepara (preprocesamiento) para un patron. */
    private record Algoritmo(String nombre, Function<String, Buscador> preparar) {
    }

    private static final List<Algoritmo> ALGORITMOS = List.of(
            new Algoritmo("KMP", p -> {
                int[] tabla = Kmp.tablaPrefijos(p);
                return texto -> Kmp.buscar(texto, p, tabla);
            }),
            new Algoritmo("Boyer-Moore", p -> {
                int[] tabla = BoyerMoore.tablaCaracterMalo(p);
                return texto -> BoyerMoore.buscar(texto, p, tabla);
            }),
            new Algoritmo("Rabin-Karp", p -> {
                long hash = RabinKarp.hash(p);
                long potencia = RabinKarp.potencia(p.length());
                return texto -> RabinKarp.buscar(texto, p, hash, potencia);
            }));

    /** Mide los 3 algoritmos con 1, 5, 10 y 20 articulos (los que existan). El patron ya viene en minusculas. */
    public static RespuestaComparacion comparar(String patron, List<String> textos, int repeticiones, int calentamiento) {
        Set<Integer> cantidades = new TreeSet<>(List.of(1, 5, 10, 20));
        cantidades.removeIf(c -> c > textos.size());
        cantidades.add(textos.size());

        List<Escala> escalas = new ArrayList<>();
        for (int cantidad : cantidades) {
            escalas.add(medirEscala(patron, textos.subList(0, cantidad), repeticiones, calentamiento));
        }
        return new RespuestaComparacion(patron, repeticiones, calentamiento, escalas);
    }

    private static Escala medirEscala(String patron, List<String> textos, int repeticiones, int calentamiento) {
        int caracteres = 0;
        for (String texto : textos) {
            caracteres += texto.length();
        }

        List<Medicion> mediciones = new ArrayList<>();
        boolean iguales = true;
        int ocurrencias = -1;

        for (Algoritmo algoritmo : ALGORITMOS) {
            long[] pre = new long[repeticiones];
            long[] busqueda = new long[repeticiones];
            int total = 0;

            for (int r = -calentamiento; r < repeticiones; r++) {
                long t0 = System.nanoTime();
                Buscador buscador = algoritmo.preparar().apply(patron);
                long t1 = System.nanoTime();
                total = 0;
                for (String texto : textos) {
                    total += buscador.buscar(texto).size();
                }
                long t2 = System.nanoTime();

                if (r >= 0) { // las ejecuciones de calentamiento no se guardan
                    pre[r] = t1 - t0;
                    busqueda[r] = t2 - t1;
                }
            }

            if (ocurrencias == -1) {
                ocurrencias = total;
            } else if (ocurrencias != total) {
                iguales = false;
            }
            mediciones.add(new Medicion(algoritmo.nombre(),
                    mediana(pre), mediana(busqueda), promedio(pre), promedio(busqueda)));
        }
        return new Escala(textos.size(), caracteres, ocurrencias, iguales, mediciones);
    }

    private static long mediana(long[] valores) {
        long[] copia = valores.clone();
        Arrays.sort(copia);
        return copia[copia.length / 2];
    }

    private static long promedio(long[] valores) {
        long suma = 0;
        for (long v : valores) {
            suma += v;
        }
        return suma / valores.length;
    }
}