package com.uniquindio.algoritmos.back.algoritmos.similitud.clasicos;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import com.uniquindio.algoritmos.back.algoritmos.similitud.AlgoritmoSimilitud;
import com.uniquindio.algoritmos.back.modelo.Articulo;

/**
 * Coeficiente de Similitud de Jaccard (Teoria de Conjuntos).
 *
 * Mide el grado de solapamiento entre los vocabularios de dos textos
 * mediante la formula:
 *
 *     J(A, B) = |A ∩ B| / |A ∪ B|
 *
 * donde A y B son los conjuntos de palabras (tokens) de cada abstract.
 *
 * Complejidad temporal: O(|A| + |B|)
 * Complejidad espacial: O(|A| + |B|)
 */
public class SimilitudJaccard implements AlgoritmoSimilitud {

    @Override
    public String getNombre() {
        return "Jaccard (Teoría de Conjuntos)";
    }

    @Override
    public double similitud(Articulo a, Articulo b) {
        List<String> palabrasA = a.palabras();
        List<String> palabrasB = b.palabras();

        if (palabrasA.isEmpty() && palabrasB.isEmpty()) return 1.0;

        Set<String> conjuntoA = new HashSet<>(palabrasA);
        Set<String> conjuntoB = new HashSet<>(palabrasB);

        // Interseccion: palabras comunes
        Set<String> interseccion = new HashSet<>(conjuntoA);
        interseccion.retainAll(conjuntoB);

        // Union: todas las palabras distintas
        Set<String> union = new HashSet<>(conjuntoA);
        union.addAll(conjuntoB);

        if (union.isEmpty()) return 1.0;

        return (double) interseccion.size() / union.size();
    }

    /**
     * Record con la informacion detallada para explicar visualmente el algoritmo
     * en el frontend y en la sustentacion.
     */
    public record DetalleJaccard(
        int tamConjuntoA,
        int tamConjuntoB,
        int tamInterseccion,
        int tamUnion,
        double coeficiente,
        List<String> interseccionPalabras,
        List<String> soloEnA,
        List<String> soloEnB
    ) {}

    /**
     * Genera el detalle completo de la comparacion Jaccard.
     */
    public DetalleJaccard generarDetalle(Articulo a, Articulo b) {
        Set<String> conjuntoA = new HashSet<>(a.palabras());
        Set<String> conjuntoB = new HashSet<>(b.palabras());

        Set<String> interseccion = new HashSet<>(conjuntoA);
        interseccion.retainAll(conjuntoB);

        Set<String> union = new HashSet<>(conjuntoA);
        union.addAll(conjuntoB);

        Set<String> soloA = new HashSet<>(conjuntoA);
        soloA.removeAll(conjuntoB);

        Set<String> soloB = new HashSet<>(conjuntoB);
        soloB.removeAll(conjuntoA);

        double coef = union.isEmpty() ? 1.0 : (double) interseccion.size() / union.size();

        return new DetalleJaccard(
            conjuntoA.size(),
            conjuntoB.size(),
            interseccion.size(),
            union.size(),
            coef,
            interseccion.stream().sorted().toList(),
            soloA.stream().sorted().toList(),
            soloB.stream().sorted().toList()
        );
    }
}
