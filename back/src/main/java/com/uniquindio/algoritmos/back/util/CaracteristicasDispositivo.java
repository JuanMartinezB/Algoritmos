package com.uniquindio.algoritmos.back.util;

/**
 * Características del dispositivo que ejecuta el backend.
 *
 * @param procesador        identificador del procesador (en Windows, variable PROCESSOR_IDENTIFIER)
 * @param nucleos           nucleos logicos disponibles para Java
 * @param memoriaTotalMb    memoria RAM total del equipo en MB
 * @param sistemaOperativo  nombre y version del sistema operativo
 * @param versionJava       version de Java y de la maquina virtual
 */
public record CaracteristicasDispositivo(
        String procesador,
        int nucleos,
        long memoriaTotalMb,
        String sistemaOperativo,
        String versionJava) {
}
