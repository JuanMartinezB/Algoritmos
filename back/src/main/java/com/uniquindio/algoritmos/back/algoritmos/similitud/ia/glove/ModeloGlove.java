package com.uniquindio.algoritmos.back.algoritmos.similitud.ia.glove;

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
 * Tabla palabra -> vector de GloVe (glove.6B.50d, preentrenado por Stanford con Wikipedia + Gigaword).
 *
 * El archivo original es texto plano SIN encabezado, una palabra y sus 50 numeros por linea:
 *   the 0.418 0.24968 -0.41242 ...
 *
 * Como el archivo completo tiene 400.000 palabras (~170 MB), la primera vez se guarda una copia
 * con solo las palabras del corpus (el "filtrado"). Al filtrado se le agrega un encabezado
 * "cantidad dimensiones", igual que en FastText, para leer los dos modelos de la misma forma.
 * Si cambias el corpus, borra el filtrado.
 */
public class ModeloGlove {

    private final Map<String, double[]> vectores = new HashMap<>();
    private int dimension;

    public ModeloGlove(Path completo, Path filtrado, Set<String> vocabulario) throws IOException {
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

    /** Copia del archivo completo con solo las lineas de las palabras del corpus. */
    private void crearFiltrado(Path completo, Path filtrado, Set<String> vocabulario) throws IOException {
        if (!Files.exists(completo)) {
            throw new IOException("No se encontro " + completo.toAbsolutePath()
                    + ". Descarga glove.6B.zip de https://nlp.stanford.edu/projects/glove/ y usa glove.6B.50d.txt");
        }
        List<String> lineas = new ArrayList<>();
        int dimensiones = 0;
        try (BufferedReader lector = Files.newBufferedReader(completo)) {
            String linea;
            while ((linea = lector.readLine()) != null) {
                int fin = linea.indexOf(' ');
                String[] partes = linea.strip().split(" ");
                if (fin <= 0 || partes.length < 3) {
                    continue; // linea vacia o encabezado "N d" (algunas copias de GloVe lo traen)
                }
                if (dimensiones == 0) {
                    dimensiones = partes.length - 1;
                }
                if (vocabulario.contains(linea.substring(0, fin))) {
                    lineas.add(linea);
                }
            }
        }
        lineas.add(0, lineas.size() + " " + dimensiones);
        Files.createDirectories(filtrado.toAbsolutePath().getParent());
        Files.write(filtrado, lineas);
    }

    /** Lee el filtrado: la primera linea es el encabezado, las demas son palabra + numeros. */
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
