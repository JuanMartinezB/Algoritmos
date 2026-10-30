package com.uniquindio.algoritmos.back.pdf;

/** Lo que se lee de un PDF: texto de las primeras paginas y el autor de los metadatos (puede venir vacio). */
public record DocumentoPdf(String texto, String autorMetadatos) {
}