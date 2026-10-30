package com.uniquindio.algoritmos.back.pdf;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Path;

/**
 * Lee un PDF con Apache PDFBox. Es la unica clase que depende de PDFBox
 * (leer un PDF no es parte de los algoritmos del proyecto).
 */
@Component
public class LectorPdf {

    /** El titulo y el abstract estan en las primeras paginas; no hace falta leer mas. */
    private static final int PAGINAS_A_LEER = 2;

    public DocumentoPdf leer(Path archivo) throws IOException {
        try (PDDocument documento = Loader.loadPDF(archivo.toFile())) {
            PDFTextStripper extractor = new PDFTextStripper();
            extractor.setStartPage(1);
            extractor.setEndPage(PAGINAS_A_LEER);
            extractor.setLineSeparator("\n"); // mismo salto de linea en Windows, Linux y Mac

            String autor = documento.getDocumentInformation().getAuthor();
            return new DocumentoPdf(extractor.getText(documento), autor == null ? "" : autor);
        }
    }
}