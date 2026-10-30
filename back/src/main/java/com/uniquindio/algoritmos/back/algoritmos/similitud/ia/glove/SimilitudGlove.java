package com.uniquindio.algoritmos.back.algoritmos.similitud.ia.glove;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import com.uniquindio.algoritmos.back.algoritmos.similitud.AlgoritmoSimilitud;
import com.uniquindio.algoritmos.back.modelo.Articulo;
import com.uniquindio.algoritmos.back.util.Vectores;

/**
 * Similitud con GloVe y promedio PONDERADO por IDF:
 * 1. Cada palabra del abstract se cambia por su vector de GloVe (las que el modelo no conoce se ignoran).
 * 2. Cada palabra pesa idf(p) = 1 + ln(N / df(p)), donde N es el numero de abstracts del corpus y
 *    df(p) en cuantos abstracts aparece p. Una palabra que esta en todos los abstracts pesa 1 y una rara pesa mas.
 * 3. El vector del abstract es el promedio ponderado:  v = ( sum idf(p) * w_p ) / ( sum idf(p) ).
 *    Se suma una vez por cada aparicion de la palabra, asi que equivale a ponderar por tf * idf.
 * 4. Se comparan los dos vectores con el coseno y con la distancia euclidiana.
 *
 * La diferencia con FastText: otro modelo (GloVe, 50 dimensiones) y las palabras comunes del dominio
 * (ai, education, research...) pesan menos, asi que no dominan el vector.
 */
public class SimilitudGlove implements AlgoritmoSimilitud {

    private final ModeloGlove modelo;
    private final Map<String, Double> idf = new HashMap<>();

    public SimilitudGlove(ModeloGlove modelo, List<Articulo> corpus) {
        this.modelo = modelo;
        calcularIdf(corpus);
    }

    @Override
    public String getNombre() {
        return "GloVe";
    }

    /** idf(p) = 1 + ln(N / df(p)). df cuenta cada abstract una sola vez por palabra. */
    private void calcularIdf(List<Articulo> corpus) {
        Map<String, Integer> df = new HashMap<>();
        for (Articulo articulo : corpus) {
            Set<String> distintas = new HashSet<>(articulo.palabras());
            for (String palabra : distintas) {
                df.merge(palabra, 1, Integer::sum);
            }
        }
        int n = corpus.size();
        for (Map.Entry<String, Integer> entrada : df.entrySet()) {
            idf.put(entrada.getKey(), 1 + Math.log((double) n / entrada.getValue()));
        }
    }

    /** Peso idf de la palabra (1 si no esta en el corpus). */
    public double peso(String palabra) {
        Double p = idf.get(palabra);
        return p == null ? 1.0 : p;
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

    /** Vector del abstract = promedio de los vectores de sus palabras, ponderado por idf. */
    public double[] vector(Articulo articulo) {
        double[] suma = new double[modelo.getDimension()];
        double pesoTotal = 0;
        for (String palabra : articulo.palabras()) {
            double[] v = modelo.vector(palabra);
            if (v == null) {
                continue;
            }
            double peso = peso(palabra);
            for (int i = 0; i < suma.length; i++) {
                suma[i] += peso * v[i];
            }
            pesoTotal += peso;
        }
        if (pesoTotal > 0) {
            for (int i = 0; i < suma.length; i++) {
                suma[i] /= pesoTotal;
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
