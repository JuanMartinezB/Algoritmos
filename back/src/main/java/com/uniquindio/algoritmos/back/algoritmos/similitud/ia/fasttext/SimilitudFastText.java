package com.uniquindio.algoritmos.back.algoritmos.similitud.ia.fasttext;

import java.util.ArrayList;
import java.util.List;

import com.uniquindio.algoritmos.back.algoritmos.similitud.AlgoritmoSimilitud;
import com.uniquindio.algoritmos.back.modelo.Articulo;
import com.uniquindio.algoritmos.back.util.Vectores;

/**
 * Similitud con FastText:
 * 1. Cada palabra del abstract se cambia por su vector de FastText (las que el modelo no conoce se ignoran).
 * 2. El vector del abstract es el PROMEDIO de los vectores de sus palabras.
 * 3. Se comparan los dos vectores con el coseno y con la distancia euclidiana.
 */
public class SimilitudFastText implements AlgoritmoSimilitud {

    private final ModeloFastText modelo;

    public SimilitudFastText(ModeloFastText modelo) {
        this.modelo = modelo;
    }

    @Override
    public String getNombre() {
        return "FastText";
    }

    /** Coseno entre 0 y 1 (un coseno negativo se toma como 0). */
    @Override
    public double similitud(Articulo a, Articulo b) {
        return Math.max(0, Vectores.coseno(vector(a), vector(b)));
    }

    public double distancia(Articulo a, Articulo b) {
        return Vectores.distanciaEuclidiana(vector(a), vector(b));
    }

    /** Distancia convertida a similitud entre 0 y 1: 1 / (1 + d). */
    public double similitudEuclidiana(Articulo a, Articulo b) {
        return 1.0 / (1.0 + distancia(a, b));
    }

    /** Vector del abstract = promedio de los vectores de sus palabras. */
    public double[] vector(Articulo articulo) {
        double[] suma = new double[modelo.getDimension()];
        int encontradas = 0;
        for (String palabra : articulo.palabras()) {
            double[] v = modelo.vector(palabra);
            if (v == null) {
                continue;
            }
            for (int i = 0; i < suma.length; i++) {
                suma[i] += v[i];
            }
            encontradas++;
        }
        if (encontradas > 0) {
            for (int i = 0; i < suma.length; i++) {
                suma[i] /= encontradas;
            }
        }
        return suma;
    }

    /** Palabras del abstract que el modelo no conoce (sin repetir). */
    public List<String> noEncontradas(Articulo articulo) {
        List<String> faltantes = new ArrayList<>();
        for (String palabra : articulo.palabras()) {
            if (modelo.vector(palabra) == null && !faltantes.contains(palabra)) {
                faltantes.add(palabra);
            }
        }
        return faltantes;
    }

    /** Todos los numeros del calculo entre dos abstracts (para el caso de estudio). */
    public record Detalle(
            List<String> noEncontradasA, List<String> noEncontradasB,
            double[] vectorA, double[] vectorB,
            double productoPunto, double normaA, double normaB, double coseno,
            double sumaDiferenciasCuadradas, double distancia, double similitudEuclidiana) {
    }

    public Detalle detalle(Articulo a, Articulo b) {
        double[] va = vector(a);
        double[] vb = vector(b);
        return new Detalle(noEncontradas(a), noEncontradas(b), va, vb,
                Vectores.productoPunto(va, vb), Vectores.norma(va), Vectores.norma(vb),
                Vectores.coseno(va, vb), Vectores.sumaDiferenciasCuadradas(va, vb),
                Vectores.distanciaEuclidiana(va, vb), similitudEuclidiana(a, b));
    }
}