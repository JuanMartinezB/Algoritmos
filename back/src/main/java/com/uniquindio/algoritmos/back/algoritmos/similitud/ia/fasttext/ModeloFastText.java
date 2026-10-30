package com.uniquindio.algoritmos.back.algoritmos.similitud.ia.fasttext;

import java.io.BufferedReader;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Tabla palabra -> vector de FastText (wiki-news-300d-1M, preentrenado por Meta).
 *
 * El archivo .vec es texto plano:
 *   999994 300                     <- encabezado: cantidad de palabras y dimensiones
 *   education 0.0123 -0.0456 ...   <- una palabra y sus 300 numeros por linea
 *
 * Como el archivo completo pesa ~2 GB, la primera vez se guarda una copia con
 * solo las palabras del corpus (el "filtrado"). Si cambias el corpus, borra el filtrado.
 */
public class ModeloFastText {

    private final Map<String, double[]> vectores = new HashMap<>();
    private int dimension;

    public ModeloFastText(Path completo, Path filtrado, Set<String> vocabulario) throws IOException {
        if (!Files.exists(filtrado)) {
            crearFiltrado(completo, filtrado, vocabulario);
        }
        leer(filtrado);
    }

    /** Vector de la palabra, o null si el modelo no la conoce. */
    public double[] vector(String palabra) {
        return vectores.get(palabra);
    }

    public int getDimension() {
        return dimension;
    }

    /** Copia del .vec completo con solo las lineas de las palabras del corpus. */
    private void crearFiltrado(Path completo, Path filtrado, Set<String> vocabulario) throws IOException {
        if (!Files.exists(completo)) {
            throw new IOException("No se encontro " + completo.toAbsolutePath()
                    + ". Descargalo de https://fasttext.cc/docs/en/english-vectors.html");
        }
        List<String> lineas = new ArrayList<>();
        String dimensiones;
        try (BufferedReader lector = Files.newBufferedReader(completo)) {
            dimensiones = lector.readLine().split(" ")[1];
            String linea;
            while ((linea = lector.readLine()) != null) {
                int fin = linea.indexOf(' ');
                if (fin > 0 && vocabulario.contains(linea.substring(0, fin))) {
                    lineas.add(linea);
                }
            }
        }
        lineas.add(0, lineas.size() + " " + dimensiones);
        Files.createDirectories(filtrado.toAbsolutePath().getParent());
        Files.write(filtrado, lineas);
    }

    /** Lee el .vec: la primera linea es el encabezado, las demas son palabra + numeros. */
    private void leer(Path archivo) throws IOException {
        try (BufferedReader lector = Files.newBufferedReader(archivo)) {
            dimension = Integer.parseInt(lector.readLine().split(" ")[1]);
            String linea;
            while ((linea = lector.readLine()) != null) {
                String[] partes = linea.strip().split(" ");
                if (partes.length != dimension + 1) {
                    continue; // linea rara: se omite
                }
                double[] vector = new double[dimension];
                for (int i = 0; i < dimension; i++) {
                    vector[i] = Double.parseDouble(partes[i + 1]);
                }
                vectores.put(partes[0], vector);
            }
        }
    }
}