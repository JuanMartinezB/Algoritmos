package com.uniquindio.algoritmos.back.algoritmos.agrupamiento;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Dibuja el dendrograma como imagen SVG (texto). Cada fusion es una "U" cuya altura es la distancia
 * a la que se unieron los grupos. La linea roja punteada muestra donde se corta para obtener k grupos.
 * No usa librerias externas.
 */
public final class Dendrograma {

    private Dendrograma() {
    }

    public static String aSvg(int n, List<Fusion> fusiones, String[] etiquetas, String titulo, int k) {
        int margenX = 50;
        int separacion = 46;
        int alto = 320;
        int base = 60 + alto;
        int ancho = 2 * margenX + n * separacion;
        double maxDist = 0;
        for (Fusion f : fusiones) {
            maxDist = Math.max(maxDist, f.distancia());
        }
        if (maxDist == 0) {
            maxDist = 1;
        }

        // Orden de las hojas: recorrido del arbol desde la raiz (id 2n-2)
        List<Integer> orden = new ArrayList<>();
        recorrer(2 * n - 2, n, fusiones, orden);

        // Posicion (x, y) de cada nodo: hoja en la base; nodo interno a la altura de su distancia
        double[] x = new double[2 * n - 1];
        double[] y = new double[2 * n - 1];
        for (int p = 0; p < n; p++) {
            x[orden.get(p)] = margenX + p * separacion + separacion / 2.0;
            y[orden.get(p)] = base;
        }

        StringBuilder svg = new StringBuilder();
        svg.append(String.format(Locale.US,
                "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 %d %d\" width=\"%d\" height=\"%d\" font-family=\"Arial\">%n",
                ancho, base + 120, ancho, base + 120));
        svg.append(String.format(Locale.US, "<rect width=\"100%%\" height=\"100%%\" fill=\"white\"/>%n"));
        svg.append(String.format(Locale.US, "<text x=\"%d\" y=\"24\" font-size=\"16\" font-weight=\"bold\">%s</text>%n",
                margenX, titulo));
        for (int s = 0; s < fusiones.size(); s++) {
            Fusion f = fusiones.get(s);
            int nodo = n + s;
            x[nodo] = (x[f.idA()] + x[f.idB()]) / 2;
            y[nodo] = base - f.distancia() / maxDist * alto;
            svg.append(linea(x[f.idA()], y[f.idA()], x[f.idA()], y[nodo]));
            svg.append(linea(x[f.idB()], y[f.idB()], x[f.idB()], y[nodo]));
            svg.append(linea(x[f.idA()], y[nodo], x[f.idB()], y[nodo]));
        }
        // Linea de corte: entre la fusion n-k-1 (ultima que se aplica) y la n-k (primera que no)
        if (k >= 2 && k <= n - 1) {
            double corte = (fusiones.get(n - k - 1).distancia() + fusiones.get(n - k).distancia()) / 2;
            double yc = base - corte / maxDist * alto;
            svg.append(String.format(Locale.US,
                    "<line x1=\"%d\" y1=\"%.1f\" x2=\"%d\" y2=\"%.1f\" stroke=\"#c0392b\" stroke-width=\"1.2\" stroke-dasharray=\"6 4\"/>%n",
                    margenX, yc, ancho - margenX / 2, yc));
            svg.append(String.format(Locale.US,
                    "<text x=\"%d\" y=\"%.1f\" font-size=\"11\" fill=\"#c0392b\" text-anchor=\"end\">corte: k = %d</text>%n",
                    ancho - margenX / 2, yc - 4, k));
        }
        for (int p = 0; p < n; p++) {
            int hoja = orden.get(p);
            svg.append(String.format(Locale.US,
                    "<text x=\"%.1f\" y=\"%d\" font-size=\"11\" text-anchor=\"end\" transform=\"rotate(-55 %.1f %d)\">%s</text>%n",
                    x[hoja], base + 14, x[hoja], base + 14, etiquetas[hoja]));
        }
        svg.append(String.format(Locale.US,
                "<text x=\"6\" y=\"%d\" font-size=\"10\">0</text><text x=\"6\" y=\"%.0f\" font-size=\"10\">%.4f</text>%n",
                base, base - alto + 4.0, maxDist));
        svg.append("</svg>");
        return svg.toString();
    }

    private static void recorrer(int nodo, int n, List<Fusion> fusiones, List<Integer> orden) {
        if (nodo < n) {
            orden.add(nodo);
            return;
        }
        Fusion f = fusiones.get(nodo - n);
        recorrer(f.idA(), n, fusiones, orden);
        recorrer(f.idB(), n, fusiones, orden);
    }

    private static String linea(double x1, double y1, double x2, double y2) {
        return String.format(Locale.US,
                "<line x1=\"%.1f\" y1=\"%.1f\" x2=\"%.1f\" y2=\"%.1f\" stroke=\"#333\" stroke-width=\"1.5\"/>%n",
                x1, y1, x2, y2);
    }
}
