package com.uniquindio.algoritmos.back.pdf;

import java.text.Normalizer;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.stereotype.Component;

/**
 * Aisla el abstract del texto de la primera pagina de un PDF.
 *
 * Regla: el abstract empieza despues de la palabra "Abstract" y termina donde aparezca
 * lo primero de esta lista: "Keywords", "1. Introduction" o "Introduction".
 * Recibe un String (no un PDF), asi se puede probar con textos de ejemplo.
 */
@Component
public class ExtractorAbstract {

    private static final int FLAGS = Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE;

    /** "A B S T R A C T" (Elsevier) tambien cuenta: \\s? permite un espacio entre letras. */
    private static final Pattern INICIO = Pattern.compile("\\ba\\s?b\\s?s\\s?t\\s?r\\s?a\\s?c\\s?t\\b", FLAGS);

    private static final Pattern FIN = Pattern.compile(
            "\\n\\s*k\\s?e\\s?y\\s?w\\s?o\\s?r\\s?d\\s?s?\\b"   // linea que empieza con Keywords
                    + "|\\b1\\s*\\.\\s*introduction\\b"          // 1. Introduction
                    + "|\\n\\s*introduction\\b", FLAGS);         // Introduction en su propia linea

    /**
     * En articulos con formato Elsevier o dos columnas (como el articulo 7), la seccion "Keywords:"
     * puede aparecer en el texto extraido antes del contenido del abstract, justo despues de "ABSTRACT".
     */
    private static final Pattern KEYWORDS_INICIO = Pattern.compile("^\\s*k\\s?e\\s?y\\s?w\\s?o\\s?r\\s?d\\s?s?:?\\s*\\n", FLAGS);

    /** Si no se encuentra el fin, se toman como maximo estos caracteres. */
    private static final int LONGITUD_MAXIMA = 2500;

    /** Devuelve el abstract en una sola linea, o null si el texto no tiene la palabra "Abstract". */
    public String extraer(String texto) {
        // "ﬁ" (ligadura) -> "fi"
        String limpio = Normalizer.normalize(texto, Normalizer.Form.NFKC);

        Matcher inicio = INICIO.matcher(limpio);
        if (!inicio.find()) {
            return null;
        }
        String resto = limpio.substring(inicio.end());

        // Si el abstract tiene inmediatamente un bloque de Keywords al inicio (caso Elsevier / dos columnas)
        Matcher mKw = KEYWORDS_INICIO.matcher(resto);
        if (mKw.find()) {
            String despuesKw = resto.substring(mKw.end());
            String[] lineas = despuesKw.split("\n", -1);
            int idxParrafo = 0;
            for (int i = 0; i < lineas.length; i++) {
                String linea = lineas[i].trim();
                if (linea.length() > 60) {
                    idxParrafo = i;
                    break;
                }
            }
            StringBuilder sb = new StringBuilder();
            for (int i = idxParrafo; i < lineas.length; i++) {
                sb.append(lineas[i]).append("\n");
            }
            resto = sb.toString();
        }

        Matcher fin = FIN.matcher(resto);
        String resumen = fin.find()
                ? resto.substring(0, fin.start())
                : resto.substring(0, Math.min(LONGITUD_MAXIMA, resto.length()));

        resumen = resumen.replaceAll("-\\n(?=[a-z])", "");   // "gener-\native" -> "generative"
        resumen = resumen.replaceAll("\\s+", " ").strip();   // un solo espacio entre palabras
        resumen = resumen.replaceAll("^[:.\\-—∗* ]+", "");   // signos sueltos al inicio ("Abstract:")
        return resumen.isEmpty() ? null : resumen;
    }
}
