package com.uniquindio.algoritmos.back.modelo;

import java.util.List;

/**
 * Un articulo ya preprocesado. Es un "record": una clase inmutable que solo guarda datos.
 * Los nombres de los campos son los mismos que salen en articulos.json.
 */
public record Articulo(
        int id,
        String titulo,
        String autores,
        String autoresCorto,          // "Primer Autor et al."
        String resumenOriginal,       // abstract tal cual salio del PDF (en una sola linea)
        String resumenProcesado,      // palabras finales unidas por espacio
        int cantidadPalabras,         // palabras que quedaron despues del preprocesamiento
        int totalPalabrasOriginales,  // palabras del abstract antes de preprocesar
        String archivo,               // nombre del PDF
        List<String> palabras) {      // lista de tokens finales
}