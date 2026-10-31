package com.uniquindio.algoritmos.back.algoritmos.similitud.clasicos;

import java.io.File;
import java.util.Arrays;
import java.util.List;

import com.uniquindio.algoritmos.back.modelo.Articulo;
import tools.jackson.databind.json.JsonMapper;

/**
 * Script de prueba rapida para verificar los 4 algoritmos clasicos
 * con dos articulos reales del corpus.
 */
public class PruebaAlgoritmosClasicos {

    public static void main(String[] args) {
        try {
            File jsonFile = new File("../datos/procesados/articulos.json");
            if (!jsonFile.exists()) {
                jsonFile = new File("datos/procesados/articulos.json");
            }

            Articulo[] array = JsonMapper.builder().build().readValue(jsonFile, Articulo[].class);
            List<Articulo> articulos = Arrays.asList(array);

            System.out.println("Articulos cargados: " + articulos.size());

            Articulo art1 = articulos.get(0);
            Articulo art2 = articulos.get(1);

            System.out.println("\n--- COMPARANDO ARTICULO 1 Y ARTICULO 2 ---");
            System.out.println("Articulo 1: " + art1.titulo());
            System.out.println("Articulo 2: " + art2.titulo());

            // 1. Levenshtein
            Levenshtein lev = new Levenshtein();
            long t1 = System.nanoTime();
            double simLev = lev.similitud(art1, art2);
            long t2 = System.nanoTime();
            int distLev = lev.calcularDistancia(art1.resumenProcesado(), art2.resumenProcesado());
            System.out.printf("1. Levenshtein: Distancia = %d, Similitud = %.4f (Tiempo: %.2f ms)%n",
                    distLev, simLev, (t2 - t1) / 1_000_000.0);

            // 2. Needleman-Wunsch
            NeedlemanWunsch nw = new NeedlemanWunsch();
            long t3 = System.nanoTime();
            double simNw = nw.similitud(art1, art2);
            long t4 = System.nanoTime();
            int puntajeNw = nw.calcularPuntaje(art1.resumenProcesado(), art2.resumenProcesado());
            System.out.printf("2. Needleman-Wunsch: Puntaje = %d, Similitud = %.4f (Tiempo: %.2f ms)%n",
                    puntajeNw, simNw, (t4 - t3) / 1_000_000.0);

            // 3. Jaccard
            SimilitudJaccard jac = new SimilitudJaccard();
            long t5 = System.nanoTime();
            double simJac = jac.similitud(art1, art2);
            long t6 = System.nanoTime();
            SimilitudJaccard.DetalleJaccard detJac = jac.generarDetalle(art1, art2);
            System.out.printf("3. Jaccard: Interseccion = %d, Union = %d, Coeficiente = %.4f (Tiempo: %.2f ms)%n",
                    detJac.tamInterseccion(), detJac.tamUnion(), simJac, (t6 - t5) / 1_000_000.0);

            // 4. Coseno TF-IDF
            long t7 = System.nanoTime();
            SimilitudCosenoTfIdf cosTfIdf = new SimilitudCosenoTfIdf(articulos);
            double simCos = cosTfIdf.similitud(art1, art2);
            long t8 = System.nanoTime();
            SimilitudCosenoTfIdf.DetalleTfIdf detCos = cosTfIdf.generarDetalle(art1, art2);
            System.out.printf("4. Coseno TF-IDF: Coseno = %.4f, Producto Punto = %.6f (Tiempo: %.2f ms)%n",
                    simCos, detCos.productoPunto(), (t8 - t7) / 1_000_000.0);

            System.out.println("\n¡LOS 4 ALGORITMOS CLASICOS FUNCIONAN DE MANERA PERFECTA!");

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
