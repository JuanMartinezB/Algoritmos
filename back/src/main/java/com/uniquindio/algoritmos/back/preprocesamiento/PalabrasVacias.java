package com.uniquindio.algoritmos.back.preprocesamiento;

import java.util.Set;

/**
 * Lista de palabras vacias (stopwords): palabras muy comunes que no aportan significado
 * (articulos, preposiciones, pronombres, verbos auxiliares). Los abstracts estan en ingles.
 * Se usa un Set porque preguntar "esta en el conjunto?" es O(1).
 */
public final class PalabrasVacias {

    private static final Set<String> LISTA = Set.of(
            "a", "about", "above", "after", "again", "against", "all", "also", "am", "an", "and", "any",
            "are", "as", "at", "be", "because", "been", "before", "being", "below", "between", "both",
            "but", "by", "can", "could", "did", "do", "does", "doing", "down", "during", "each", "either",
            "few", "for", "from", "further", "had", "has", "have", "having", "he", "her", "here", "hers",
            "him", "his", "how", "however", "i", "if", "in", "into", "is", "it", "its", "itself", "may",
            "me", "might", "more", "most", "must", "my", "neither", "no", "nor", "not", "of", "off", "on",
            "once", "only", "or", "other", "our", "ours", "out", "over", "own", "same", "shall", "she",
            "should", "so", "some", "such", "than", "that", "the", "their", "theirs", "them", "then",
            "there", "these", "they", "this", "those", "through", "thus", "to", "too", "under", "until",
            "up", "us", "very", "was", "we", "were", "what", "when", "where", "which", "while", "who",
            "whom", "whose", "why", "will", "with", "within", "without", "would", "you", "your", "yours",
            "via", "per", "et", "al", "etc", "eg", "ie");

    private PalabrasVacias() {
    }

    public static boolean esVacia(String palabra) {
        return LISTA.contains(palabra);
    }
}