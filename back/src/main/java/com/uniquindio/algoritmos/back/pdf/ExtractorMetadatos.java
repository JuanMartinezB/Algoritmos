package com.uniquindio.algoritmos.back.pdf;

import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Obtiene id, titulo y autores.
 *
 * - Id y titulo: el nombre del archivo ("1. Titulo del articulo.pdf") ya los trae.
 * - Autores: primero el campo Author de los metadatos del PDF; si esta vacio,
 *   se busca una linea con pinta de nombres antes de la palabra "Abstract".
 */
@Component
public class ExtractorMetadatos {

    /** Nombre de archivo: numero, punto, titulo. */
    private static final Pattern NOMBRE = Pattern.compile("^(\\d+)\\.\\s*(.*?)(\\.pdf)?$", Pattern.CASE_INSENSITIVE);

    /** Si una linea contiene alguna de estas palabras, NO es la linea de autores. */
    private static final String[] NO_AUTOR = {"university", "universit", "department", "institute", "school",
            "journal", "doi", "http", "@", "received", "accepted", "available", "copyright", "©",
            "article", "elsevier", "springer", "mdpi", "wiley", "emerald", "keywords", "abstract"};

    public int idDesdeArchivo(String nombreArchivo) {
        Matcher m = NOMBRE.matcher(nombreArchivo);
        return m.matches() ? Integer.parseInt(m.group(1)) : 0;
    }

    public String titulo(String nombreArchivo) {
        Matcher m = NOMBRE.matcher(nombreArchivo);
        return m.matches() ? m.group(2).strip() : nombreArchivo;
    }

    public String autores(DocumentoPdf doc) {
        String deMetadatos = limpiarAutores(doc.autorMetadatos());
        if (deMetadatos.length() > 3) {
            return deMetadatos;
        }
        // Plan B: buscar en el texto, solo antes de "Abstract"
        String texto = doc.texto();
        int corte = texto.toLowerCase(Locale.ROOT).indexOf("abstract");
        String cabecera = corte > 0 ? texto.substring(0, corte) : texto;
        for (String linea : cabecera.split("\n")) {
            if (pareceLineaDeAutores(linea)) {
                return limpiarAutores(linea);
            }
        }
        return "";
    }

    /** "Primer Autor et al." si hay varios autores; si hay uno solo, ese nombre. */
    public String autoresCorto(String autores) {
        if (autores.isBlank()) {
            return "";
        }
        String[] partes = autores.split(",|;| and | & ");
        String primero = partes[0].strip();
        return partes.length > 1 ? primero + " et al." : primero;
    }

    private boolean pareceLineaDeAutores(String linea) {
        String l = linea.strip();
        String minus = l.toLowerCase(Locale.ROOT);
        if (l.length() < 6 || l.length() > 250 || Arrays.stream(NO_AUTOR).anyMatch(minus::contains)) {
            return false;
        }
        boolean separador = l.contains(",") || minus.contains(" and ");
        // al menos dos palabras que empiezan en mayuscula
        long mayusculas = Arrays.stream(l.split("\\s+")).filter(p -> !p.isEmpty() && Character.isUpperCase(p.charAt(0))).count();
        return separador && mayusculas >= 2;
    }

    /** Quita numeros, asteriscos y marcas de afiliacion pegadas a los nombres. */
    private String limpiarAutores(String texto) {
        if (texto == null) {
            return "";
        }
        return texto.replaceAll("[0-9*†‡∗§¶]", "").replaceAll("\\s+", " ").replaceAll("\\s+,", ",").strip();
    }
}