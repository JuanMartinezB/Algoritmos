package com.uniquindio.algoritmos.back.algoritmos.similitud.clasicos;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;

import com.uniquindio.algoritmos.back.algoritmos.similitud.AlgoritmoSimilitud;
import com.uniquindio.algoritmos.back.modelo.Articulo;
import com.uniquindio.algoritmos.back.util.Vectores;

/**
 * Similitud del Coseno con ponderacion TF-IDF (Modelo de Espacio Vectorial).
 *
 * Cada abstract se convierte en un vector numerico cuyo valor por dimension
 * es el peso TF-IDF de cada termino.  La similitud se calcula como el coseno
 * del angulo entre ambos vectores.
 *
 * TF(t, d)  = frecuencia del termino t en el documento d / total de terminos de d
 * IDF(t, D) = log(|D| / (1 + documentos que contienen t))
 * Peso      = TF * IDF
 *
 * Complejidad temporal: O(|vocabulario| * |corpus|)  para calcular IDF una vez
 *                     + O(|vocabulario|) por cada par de articulos
 * Complejidad espacial: O(|vocabulario|)
 */
public class SimilitudCosenoTfIdf implements AlgoritmoSimilitud {

    /**
     * Tabla IDF global del corpus: se calcula una vez y se reutiliza.
     * Clave = termino, Valor = log(N / (1 + df))
     */
    private final Map<String, Double> idfGlobal;
    private final int totalDocumentos;

    /**
     * Constructor que recibe la lista completa de articulos del corpus
     * para poder calcular la componente IDF.
     */
    public SimilitudCosenoTfIdf(List<Articulo> corpus) {
        this.totalDocumentos = corpus.size();
        this.idfGlobal = calcularIdf(corpus);
    }

    @Override
    public String getNombre() {
        return "Coseno TF-IDF (Espacio Vectorial)";
    }

    /**
     * Calcula la frecuencia de documento (DF) y luego IDF para cada termino
     * presente en al menos un articulo del corpus.
     */
    private Map<String, Double> calcularIdf(List<Articulo> corpus) {
        // Paso 1: contar en cuantos documentos aparece cada termino
        Map<String, Integer> df = new HashMap<>();
        for (Articulo art : corpus) {
            // Se usa un Set por documento para no contar un termino mas de una vez
            Set<String> unicos = new TreeSet<>(art.palabras());
            for (String palabra : unicos) {
                df.merge(palabra, 1, Integer::sum);
            }
        }

        // Paso 2: calcular IDF suavizado (smooth IDF) = log((1 + N) / (1 + df)) + 1.0
        // Garantiza pesos estrictamente positivos en todo el vocabulario
        Map<String, Double> idf = new HashMap<>();
        int n = corpus.size();
        for (Map.Entry<String, Integer> entry : df.entrySet()) {
            idf.put(entry.getKey(), Math.log((1.0 + n) / (1.0 + entry.getValue())) + 1.0);
        }
        return idf;
    }

    /**
     * Construye el vector TF-IDF de un articulo dado un vocabulario ordenado.
     */
    public double[] construirVector(Articulo articulo, List<String> vocabulario) {
        // Calcular TF: frecuencia de cada termino en el documento
        Map<String, Integer> frecuencias = new HashMap<>();
        for (String palabra : articulo.palabras()) {
            frecuencias.merge(palabra, 1, Integer::sum);
        }
        int totalPalabras = articulo.palabras().size();

        double[] vector = new double[vocabulario.size()];
        for (int i = 0; i < vocabulario.size(); i++) {
            String termino = vocabulario.get(i);
            int freq = frecuencias.getOrDefault(termino, 0);
            double tf = totalPalabras == 0 ? 0 : (double) freq / totalPalabras;
            double idf = idfGlobal.getOrDefault(termino, 0.0);
            vector[i] = tf * idf;
        }
        return vector;
    }

    @Override
    public double similitud(Articulo a, Articulo b) {
        // Vocabulario comun: union de palabras de ambos articulos
        Set<String> vocab = new TreeSet<>(a.palabras());
        vocab.addAll(b.palabras());
        List<String> vocabularioOrdenado = vocab.stream().sorted().toList();

        if (vocabularioOrdenado.isEmpty()) return 1.0;

        double[] vecA = construirVector(a, vocabularioOrdenado);
        double[] vecB = construirVector(b, vocabularioOrdenado);

        double cos = Vectores.coseno(vecA, vecB);
        return Math.max(0.0, Math.min(1.0, cos));
    }

    /**
     * Record con la informacion detallada para visualizar en el frontend.
     */
    public record DetalleTfIdf(
        int dimensionesVector,
        int totalDocumentosCorpus,
        double similitudCoseno,
        double productoPunto,
        double normaA,
        double normaB,
        List<TerminoDetalle> topTerminosA,
        List<TerminoDetalle> topTerminosB,
        List<TerminoDetalle> topTerminosComunes
    ) {}

    public record TerminoDetalle(
        String termino,
        double tfA,
        double tfB,
        double idf,
        double pesoA,
        double pesoB
    ) {}

    /**
     * Genera el detalle completo de la comparacion con TF-IDF.
     */
    public DetalleTfIdf generarDetalle(Articulo a, Articulo b) {
        Set<String> vocab = new TreeSet<>(a.palabras());
        vocab.addAll(b.palabras());
        List<String> vocabularioOrdenado = vocab.stream().sorted().toList();

        // Calcular TFs
        Map<String, Integer> freqA = new HashMap<>();
        for (String p : a.palabras()) freqA.merge(p, 1, Integer::sum);
        Map<String, Integer> freqB = new HashMap<>();
        for (String p : b.palabras()) freqB.merge(p, 1, Integer::sum);

        int totalA = a.palabras().size();
        int totalB = b.palabras().size();

        double[] vecA = construirVector(a, vocabularioOrdenado);
        double[] vecB = construirVector(b, vocabularioOrdenado);

        double coseno = Math.max(0.0, Math.min(1.0, Vectores.coseno(vecA, vecB)));
        double pp = Vectores.productoPunto(vecA, vecB);
        double nA = Vectores.norma(vecA);
        double nB = Vectores.norma(vecB);

        // Construir los top terminos para visualizacion
        List<TerminoDetalle> todosTerminos = new java.util.ArrayList<>();
        for (int i = 0; i < vocabularioOrdenado.size(); i++) {
            String t = vocabularioOrdenado.get(i);
            double tfA_val = totalA == 0 ? 0 : (double) freqA.getOrDefault(t, 0) / totalA;
            double tfB_val = totalB == 0 ? 0 : (double) freqB.getOrDefault(t, 0) / totalB;
            double idfVal = idfGlobal.getOrDefault(t, 0.0);
            todosTerminos.add(new TerminoDetalle(t, tfA_val, tfB_val, idfVal, vecA[i], vecB[i]));
        }

        // Top 10 por peso en A
        List<TerminoDetalle> topA = todosTerminos.stream()
            .sorted((x, y) -> Double.compare(y.pesoA(), x.pesoA()))
            .limit(10)
            .toList();

        // Top 10 por peso en B
        List<TerminoDetalle> topB = todosTerminos.stream()
            .sorted((x, y) -> Double.compare(y.pesoB(), x.pesoB()))
            .limit(10)
            .toList();

        // Top 10 terminos comunes (ambos pesos > 0), ordenados por el producto de pesos
        List<TerminoDetalle> topComunes = todosTerminos.stream()
            .filter(td -> td.pesoA() > 0 && td.pesoB() > 0)
            .sorted((x, y) -> Double.compare(y.pesoA() * y.pesoB(), x.pesoA() * x.pesoB()))
            .limit(10)
            .toList();

        return new DetalleTfIdf(
            vocabularioOrdenado.size(),
            totalDocumentos,
            coseno, pp, nA, nB,
            topA, topB, topComunes
        );
    }
}
