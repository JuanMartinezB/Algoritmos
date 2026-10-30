package com.uniquindio.algoritmos.back.preprocesamiento;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Stream;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.uniquindio.algoritmos.back.modelo.Articulo;
import com.uniquindio.algoritmos.back.pdf.DocumentoPdf;
import com.uniquindio.algoritmos.back.pdf.ExtractorAbstract;
import com.uniquindio.algoritmos.back.pdf.ExtractorMetadatos;
import com.uniquindio.algoritmos.back.pdf.LectorPdf;

import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.SerializationFeature;
import tools.jackson.databind.json.JsonMapper;

/**
 * Orquesta el preprocesamiento. Para cada PDF de datos/pdfs_originales:
 *   PDF -> texto -> abstract -> tokens -> Articulo
 * y al final guarda todo en datos/procesados/articulos.json.
 */
@Service
public class ServicioPreprocesamiento {

    private final LectorPdf lector;
    private final ExtractorAbstract extractorAbstract;
    private final ExtractorMetadatos extractorMetadatos;
    private final Tokenizador tokenizador;
    // Jackson 3 (Spring Boot 4): el ObjectMapper es inmutable, se configura con un builder
    private final ObjectMapper json = JsonMapper.builder()
            .enable(SerializationFeature.INDENT_OUTPUT)   // JSON con sangria, facil de leer
            .build();

    private final Path carpetaPdfs;
    private final Path archivoJson;

    public ServicioPreprocesamiento(LectorPdf lector, ExtractorAbstract extractorAbstract,
                                    ExtractorMetadatos extractorMetadatos, Tokenizador tokenizador,
                                    @Value("${datos.ruta:../datos}") String rutaDatos) {
        this.lector = lector;
        this.extractorAbstract = extractorAbstract;
        this.extractorMetadatos = extractorMetadatos;
        this.tokenizador = tokenizador;
        Path datos = ubicarCarpetaDatos(rutaDatos);
        this.carpetaPdfs = datos.resolve("pdfs_originales");
        this.archivoJson = datos.resolve("procesados").resolve("articulos.json");
    }

    /**
     * La ruta de application.properties es relativa a la carpeta desde donde se ejecuta la app:
     * "../datos" sirve si se ejecuta dentro de back/, y "datos" si se ejecuta desde la raiz del proyecto.
     * Se prueban las dos y se usa la que tenga la carpeta pdfs_originales.
     */
    private Path ubicarCarpetaDatos(String rutaConfigurada) {
        for (String candidata : new String[]{rutaConfigurada, "../datos", "datos"}) {
            Path ruta = Path.of(candidata).toAbsolutePath().normalize();
            if (Files.isDirectory(ruta.resolve("pdfs_originales"))) {
                return ruta;
            }
        }
        return Path.of(rutaConfigurada).toAbsolutePath().normalize();
    }

    /** Ruta completa del JSON (para mostrarla en consola). */
    public Path getArchivoJson() {
        return archivoJson;
    }

    /** true si articulos.json ya existe. */
    public boolean existeJson() {
        return Files.exists(archivoJson);
    }

    /** Procesa los PDFs desde cero y reescribe articulos.json. */
    public List<Articulo> procesarTodos() throws IOException {
        List<Path> pdfs;
        try (Stream<Path> archivos = Files.list(carpetaPdfs)) {
            pdfs = archivos.filter(p -> p.getFileName().toString().toLowerCase().endsWith(".pdf"))
                    .sorted(Comparator.comparingInt(p -> extractorMetadatos.idDesdeArchivo(p.getFileName().toString())))
                    .toList();
        }

        List<Articulo> articulos = new ArrayList<>();
        for (Path pdf : pdfs) {
            Articulo a = procesarUno(pdf);
            if (a != null) {
                articulos.add(a);
            }
        }

        Files.createDirectories(archivoJson.getParent());
        json.writeValue(archivoJson.toFile(), articulos);
        return articulos;
    }

    /** Lee articulos.json; si todavia no existe, procesa los PDFs primero. */
    public List<Articulo> obtenerArticulos() throws IOException {
        if (!Files.exists(archivoJson)) {
            return procesarTodos();
        }
        return List.of(json.readValue(archivoJson.toFile(), Articulo[].class));
    }

    private Articulo procesarUno(Path pdf) throws IOException {
        String nombre = pdf.getFileName().toString();
        DocumentoPdf doc = lector.leer(pdf);

        String resumenOriginal = extractorAbstract.extraer(doc.texto());
        if (resumenOriginal == null) {
            System.out.println("[AVISO] No se encontro el abstract en: " + nombre);
            return null;
        }

        List<String> palabras = tokenizador.tokenizar(resumenOriginal);
        String autores = extractorMetadatos.autores(doc);

        return new Articulo(
                extractorMetadatos.idDesdeArchivo(nombre),
                extractorMetadatos.titulo(nombre),
                autores,
                extractorMetadatos.autoresCorto(autores),
                resumenOriginal,
                String.join(" ", palabras),
                palabras.size(),
                resumenOriginal.split("\\s+").length,   // palabras antes de preprocesar
                nombre,
                palabras);
    }
}