package com.uniquindio.algoritmos.back.preprocesamiento;

import org.springframework.stereotype.Component;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Tokenizador propio (sin librerias de NLP).
 *
 * Reglas:
 *  0. Se convierten las ligaduras de los PDF ("ﬁ" -> "fi") para no partir palabras.
 *  1. Todo el texto pasa a minusculas.
 *  2. Se toman solo secuencias de letras: numeros, signos y guiones separan palabras
 *     ("state-of-the-art" -> "state", "of", "the", "art").
 *  3. Se descartan palabras de menos de 2 letras (se conservan "ai", "ml", "llm").
 *  4. Se descartan las palabras vacias (stopwords).
 *
 * No hay stemming ni lematizacion: "model" y "models" son terminos distintos.
 */
@Component
public class Tokenizador {

    private static final int LONGITUD_MINIMA = 2;

    public List<String> tokenizar(String texto) {
        String limpio = Normalizer.normalize(texto, Normalizer.Form.NFKC).toLowerCase(Locale.ROOT);

        List<String> tokens = new ArrayList<>();
        StringBuilder palabra = new StringBuilder();

        // Se recorre caracter por caracter armando palabras
        for (int i = 0; i < limpio.length(); i++) {
            char c = limpio.charAt(i);
            if (Character.isLetter(c)) {
                palabra.append(c);                         // la palabra continua
            } else {
                agregarSiEsValida(palabra, tokens);        // la palabra termino
            }
        }
        agregarSiEsValida(palabra, tokens);                // ultima palabra del texto
        return tokens;
    }

    /** Aplica longitud minima y stopwords; luego vacia el StringBuilder para la siguiente palabra. */
    private void agregarSiEsValida(StringBuilder palabra, List<String> tokens) {
        String p = palabra.toString();
        if (p.length() >= LONGITUD_MINIMA && !PalabrasVacias.esVacia(p)) {
            tokens.add(p);
        }
        palabra.setLength(0);
    }
}
