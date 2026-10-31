package com.uniquindio.algoritmos.back.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.uniquindio.algoritmos.back.modelo.Articulo;
import com.uniquindio.algoritmos.back.preprocesamiento.ServicioPreprocesamiento;
import com.uniquindio.algoritmos.back.util.CaracteristicasDispositivo;
import com.uniquindio.algoritmos.back.util.DispositivoUtil;

/** Endpoints que consume el front. */
@RestController
@RequestMapping("/api/articulos")
@CrossOrigin(origins = "*") // para que el front (otro puerto) pueda llamar al back
public class ArticuloController {

    private final ServicioPreprocesamiento servicio;

    public ArticuloController(ServicioPreprocesamiento servicio) {
        this.servicio = servicio;
    }

    /** GET /api/articulos -> los articulos ya procesados. */
    @GetMapping
    public List<Articulo> listar() throws IOException {
        return servicio.obtenerArticulos();
    }

    /** POST /api/articulos/procesar -> vuelve a leer los PDFs y regenera articulos.json. */
    @PostMapping("/procesar")
    public List<Articulo> reprocesar() throws IOException {
        return servicio.procesarTodos();
    }

    /** GET /api/articulos/dispositivo -> características del hardware y del entorno del backend. */
    @GetMapping("/dispositivo")
    public CaracteristicasDispositivo obtenerDispositivo() {
        return DispositivoUtil.obtenerCaracteristicas();
    }
}
