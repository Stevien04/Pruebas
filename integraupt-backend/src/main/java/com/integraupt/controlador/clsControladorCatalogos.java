package com.integraupt.controlador;

import com.integraupt.dto.clsDTOCatalogoItem;
import com.integraupt.servicio.clsServicioCatalogos;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controlador para exponer catálogos (facultades y escuelas).
 */
@RestController
@RequestMapping("/api/catalogos")
public class clsControladorCatalogos {

    private final clsServicioCatalogos servicioCatalogos;

    public clsControladorCatalogos(clsServicioCatalogos servicioCatalogos) {
        this.servicioCatalogos = servicioCatalogos;
    }

    @GetMapping("/facultades")
    public ResponseEntity<List<clsDTOCatalogoItem>> obtenerFacultades() {
        Map<Integer, String> facultades = servicioCatalogos.obtenerTodasLasFacultades();
        List<clsDTOCatalogoItem> items = facultades.entrySet().stream()
                .map(entry -> new clsDTOCatalogoItem(entry.getKey(), entry.getValue()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(items);
    }

    @GetMapping("/escuelas")
    public ResponseEntity<List<clsDTOCatalogoItem>> obtenerEscuelasPorFacultad(
            @RequestParam(name = "facultadId", required = false) Integer facultadId) {

        Map<Integer, String> escuelas = facultadId != null
                ? servicioCatalogos.obtenerEscuelasPorFacultad(facultadId)
                : servicioCatalogos.obtenerTodasLasEscuelas();

        List<clsDTOCatalogoItem> items = escuelas.entrySet().stream()
                .map(entry -> new clsDTOCatalogoItem(entry.getKey(), entry.getValue()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(items);
    }
}
