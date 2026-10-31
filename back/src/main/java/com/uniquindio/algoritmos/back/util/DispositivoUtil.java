package com.uniquindio.algoritmos.back.util;

import java.lang.management.ManagementFactory;

/**
 * Utilidad simple para recolectar las características del equipo anfitrión y de la JVM.
 */
public class DispositivoUtil {

    private DispositivoUtil() {
    }

    /**
     * Recolecta las características del hardware y del entorno de ejecución.
     *
     * @return objeto con procesador, núcleos, memoria RAM total en MB, SO y versión de Java
     */
    public static CaracteristicasDispositivo obtenerCaracteristicas() {
        // 1. Identificador del procesador
        String procesador = System.getenv("PROCESSOR_IDENTIFIER");
        if (procesador == null || procesador.isBlank()) {
            procesador = System.getProperty("os.arch") + " (" + Runtime.getRuntime().availableProcessors() + " hilos lógicos)";
        }

        // 2. Núcleos lógicos disponibles para la máquina virtual
        int nucleos = Runtime.getRuntime().availableProcessors();

        // 3. Memoria RAM total del equipo en MB
        long memoriaTotalMb;
        try {
            var osBean = ManagementFactory.getOperatingSystemMXBean();
            if (osBean instanceof com.sun.management.OperatingSystemMXBean sunOsBean) {
                memoriaTotalMb = sunOsBean.getTotalMemorySize() / (1024 * 1024);
            } else {
                memoriaTotalMb = Runtime.getRuntime().maxMemory() / (1024 * 1024);
            }
        } catch (Exception e) {
            memoriaTotalMb = Runtime.getRuntime().maxMemory() / (1024 * 1024);
        }

        // 4. Nombre y versión del sistema operativo
        String sistemaOperativo = System.getProperty("os.name") + " " + System.getProperty("os.version");

        // 5. Versión de Java y de la máquina virtual
        String versionJava = System.getProperty("java.version") + " (" + System.getProperty("java.vm.name") + ")";

        return new CaracteristicasDispositivo(procesador, nucleos, memoriaTotalMb, sistemaOperativo, versionJava);
    }
}
