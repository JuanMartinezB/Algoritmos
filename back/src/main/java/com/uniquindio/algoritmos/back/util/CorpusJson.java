package com.uniquindio.algoritmos.back.util;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.uniquindio.algoritmos.back.modelo.Articulo;

import tools.jackson.databind.json.JsonMapper;

/** Lee el corpus ya preprocesado (articulos.json, en datos/procesados). */
@Component
public class CorpusJson {

    @Value("${corpus.json:../datos/procesados/articulos.json}")
    private String rutaConfigurada;

    private List<Articulo> articulos;

    /**
     * Resuelve la ruta del archivo articulos.json admitiendo tanto la ejecución
     * desde la carpeta raíz del proyecto ("datos/procesados/articulos.json") como
     * desde la subcarpeta back/ ("../datos/procesados/articulos.json").
     */
    private File resolverArchivoJson() {
        for (String candidata : new String[]{rutaConfigurada, "datos/procesados/articulos.json", "../datos/procesados/articulos.json"}) {
            if (candidata != null && !candidata.isBlank()) {
                Path p = Path.of(candidata).toAbsolutePath().normalize();
                if (Files.exists(p)) {
                    return p.toFile();
                }
            }
        }
        return Path.of(rutaConfigurada).toAbsolutePath().normalize().toFile();
    }

    public List<Articulo> articulos() {
        if (articulos == null) {
            File archivo = resolverArchivoJson();
            if (!archivo.exists()) {
                throw new IllegalArgumentException("No se encontro el corpus: " + archivo.getAbsolutePath());
            }
            articulos = Arrays.asList(JsonMapper.builder().build().readValue(archivo, Articulo[].class));
        }
        return articulos;
    }

    public Articulo porId(long id) {
        for (Articulo articulo : articulos()) {
            if (articulo.id() == id) {
                return articulo;
            }
        }
        throw new IllegalArgumentException("No existe un articulo con id " + id);
    }

    /** Todas las palabras distintas del corpus (sirve para filtrar el .vec). */
    public Set<String> vocabulario() {
        Set<String> vocabulario = new HashSet<>();
        for (Articulo articulo : articulos()) {
            vocabulario.addAll(articulo.palabras());
        }
        return vocabulario;
    }
}
