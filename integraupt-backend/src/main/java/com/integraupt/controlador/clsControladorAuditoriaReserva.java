package com.integraupt.controlador;

import com.integraupt.dto.clsDTOAuditoriaReserva;
import com.integraupt.servicio.clsServiceAuditoriaReserva;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/auditoria-reservas")
@CrossOrigin(origins = "http://localhost:3000")
public class clsControladorAuditoriaReserva {

    @Autowired
    private clsServiceAuditoriaReserva auditoriaReservaService;

    // Obtener todos los registros de auditoría
    @GetMapping
    public ResponseEntity<List<clsDTOAuditoriaReserva>> obtenerTodasAuditorias() {
        try {
            List<clsDTOAuditoriaReserva> auditorias = auditoriaReservaService.obtenerTodasAuditorias();
            return ResponseEntity.ok(auditorias);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Obtener auditoría por ID de reserva
    @GetMapping("/reserva/{idReserva}")
    public ResponseEntity<List<clsDTOAuditoriaReserva>> obtenerAuditoriaPorReserva(@PathVariable Integer idReserva) {
        try {
            List<clsDTOAuditoriaReserva> auditorias = auditoriaReservaService.obtenerAuditoriaPorReserva(idReserva);
            return ResponseEntity.ok(auditorias);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Buscar con filtros
    @GetMapping("/buscar")
    public ResponseEntity<List<clsDTOAuditoriaReserva>> buscarAuditorias(
            @RequestParam(required = false) Integer idReserva,
            @RequestParam(required = false) Integer usuarioCambio,
            @RequestParam(required = false) String estadoAnterior,
            @RequestParam(required = false) String estadoNuevo,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaFin) {
        
        try {
            List<clsDTOAuditoriaReserva> auditorias = auditoriaReservaService.buscarConFiltros(
                idReserva, usuarioCambio, estadoAnterior, estadoNuevo, fechaInicio, fechaFin
            );
            return ResponseEntity.ok(auditorias);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Endpoint para obtener estadísticas de auditoría
    @GetMapping("/estadisticas")
    public ResponseEntity<?> obtenerEstadisticas() {
        try {
            List<clsDTOAuditoriaReserva> todasAuditorias = auditoriaReservaService.obtenerTodasAuditorias();
            
            // Calcular estadísticas básicas
            long totalRegistros = todasAuditorias.size();
            long cambiosAprobacion = todasAuditorias.stream()
                .filter(a -> "Aprobada".equals(a.getEstadoNuevo()))
                .count();
            long cambiosCancelacion = todasAuditorias.stream()
                .filter(a -> "Cancelado".equals(a.getEstadoNuevo()))
                .count();
            
            // Puedes agregar más estadísticas según necesites
            
            return ResponseEntity.ok().body(
                "{\"totalRegistros\": " + totalRegistros + 
                ", \"cambiosAprobacion\": " + cambiosAprobacion + 
                ", \"cambiosCancelacion\": " + cambiosCancelacion + "}"
            );
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}