package com.integraupt.servicio;

import com.integraupt.dto.clsDTOAuditoriaReserva;
import com.integraupt.entidad.clsEntidadAuditoriaReserva;
import com.integraupt.entidad.clsEntidadReserva;
import com.integraupt.entidad.clsEntidadUsuario;
import com.integraupt.repositorio.clsRepositorioAuditoriaReserva;
import com.integraupt.repositorio.clsRepositorioReserva;
import com.integraupt.repositorio.clsRepositorioUsuario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class clsServiceAuditoriaReserva {

    @Autowired
    private clsRepositorioAuditoriaReserva clsRepositorioAuditoriaReserva;
    
    @Autowired
    private clsRepositorioReserva clsRepositorioReserva;
    
    @Autowired
    private clsRepositorioUsuario clsRepositorioUsuario;

    // Registrar un cambio en auditoría
    public clsEntidadAuditoriaReserva registrarCambioReserva(Integer idReserva, String estadoAnterior, 
                                                           String estadoNuevo, Integer usuarioCambio) {
        clsEntidadAuditoriaReserva auditoria = new clsEntidadAuditoriaReserva(
            idReserva, estadoAnterior, estadoNuevo, usuarioCambio
        );
        return clsRepositorioAuditoriaReserva.save(auditoria);
    }

    // Obtener todos los registros de auditoría
    public List<clsDTOAuditoriaReserva> obtenerTodasAuditorias() {
        List<clsDTOAuditoriaReserva> auditoriasDTO = new ArrayList<>();
        List<clsEntidadAuditoriaReserva> auditorias = clsRepositorioAuditoriaReserva.findAll();
        
        for (clsEntidadAuditoriaReserva auditoria : auditorias) {
            clsDTOAuditoriaReserva dto = convertirAUDTO(auditoria);
            auditoriasDTO.add(dto);
        }
        
        return auditoriasDTO;
    }

    // Obtener auditoría por ID de reserva
    public List<clsDTOAuditoriaReserva> obtenerAuditoriaPorReserva(Integer idReserva) {
        List<clsDTOAuditoriaReserva> auditoriasDTO = new ArrayList<>();
        List<clsEntidadAuditoriaReserva> auditorias = clsRepositorioAuditoriaReserva.findByIdReserva(idReserva);
        
        for (clsEntidadAuditoriaReserva auditoria : auditorias) {
            clsDTOAuditoriaReserva dto = convertirAUDTO(auditoria);
            auditoriasDTO.add(dto);
        }
        
        return auditoriasDTO;
    }

    // Buscar con filtros
    public List<clsDTOAuditoriaReserva> buscarConFiltros(Integer idReserva, Integer usuarioCambio, 
                                                        String estadoAnterior, String estadoNuevo,
                                                        LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        List<clsDTOAuditoriaReserva> auditoriasDTO = new ArrayList<>();
        List<clsEntidadAuditoriaReserva> auditorias = clsRepositorioAuditoriaReserva.findWithFilters(
            idReserva, usuarioCambio, estadoAnterior, estadoNuevo, fechaInicio, fechaFin
        );
        
        for (clsEntidadAuditoriaReserva auditoria : auditorias) {
            clsDTOAuditoriaReserva dto = convertirAUDTO(auditoria);
            auditoriasDTO.add(dto);
        }
        
        return auditoriasDTO;
    }

    // Obtener auditoría por ID
    public Optional<clsEntidadAuditoriaReserva> obtenerPorId(Integer id) {
        return clsRepositorioAuditoriaReserva.findById(id);
    }

    // Obtener cambios recientes (últimos 7 días)
    public List<clsDTOAuditoriaReserva> obtenerCambiosRecientes() {
        LocalDateTime fechaInicio = LocalDateTime.now().minusDays(7);
        List<clsDTOAuditoriaReserva> auditoriasDTO = new ArrayList<>();
        List<clsEntidadAuditoriaReserva> auditorias = clsRepositorioAuditoriaReserva.findRecentChanges(fechaInicio);
        
        for (clsEntidadAuditoriaReserva auditoria : auditorias) {
            clsDTOAuditoriaReserva dto = convertirAUDTO(auditoria);
            auditoriasDTO.add(dto);
        }
        
        return auditoriasDTO;
    }

    // Obtener estadísticas de auditoría - CORREGIDO
    public Map<String, Object> obtenerEstadisticas() {
        Long totalRegistros = clsRepositorioAuditoriaReserva.countTotalRegistros();
        Long aprobaciones = clsRepositorioAuditoriaReserva.countByEstado("Aprobada");
        Long cancelaciones = clsRepositorioAuditoriaReserva.countByEstado("Cancelado");
        Long rechazos = clsRepositorioAuditoriaReserva.countByEstado("Rechazada");
        Long pendientes = clsRepositorioAuditoriaReserva.countByEstado("Pendiente");
        
        // Obtener estadísticas por día (últimos 30 días)
        LocalDateTime fechaInicio = LocalDateTime.now().minusDays(30);
        LocalDateTime fechaFin = LocalDateTime.now();
        List<Object[]> estadisticasPorDia = clsRepositorioAuditoriaReserva.findEstadisticasPorDia(fechaInicio, fechaFin);
        
        // Usar Map en lugar de objeto anónimo para evitar el error de referencia
        Map<String, Object> estadisticas = new HashMap<>();
        estadisticas.put("total", totalRegistros);
        estadisticas.put("aprobadas", aprobaciones);
        estadisticas.put("canceladas", cancelaciones);
        estadisticas.put("rechazadas", rechazos);
        estadisticas.put("pendientes", pendientes);
        estadisticas.put("porDia", estadisticasPorDia);
        
        return estadisticas;
    }

    // Obtener último cambio de una reserva
    public clsDTOAuditoriaReserva obtenerUltimoCambioReserva(Integer idReserva) {
        clsEntidadAuditoriaReserva auditoria = clsRepositorioAuditoriaReserva.findUltimoCambioPorReserva(idReserva);
        if (auditoria != null) {
            return convertirAUDTO(auditoria);
        }
        return null;
    }

    // Buscar por texto en estados
    public List<clsDTOAuditoriaReserva> buscarPorTextoEnEstados(String texto) {
        List<clsDTOAuditoriaReserva> auditoriasDTO = new ArrayList<>();
        List<clsEntidadAuditoriaReserva> auditorias = clsRepositorioAuditoriaReserva.findByTextoEnEstados(texto);
        
        for (clsEntidadAuditoriaReserva auditoria : auditorias) {
            clsDTOAuditoriaReserva dto = convertirAUDTO(auditoria);
            auditoriasDTO.add(dto);
        }
        
        return auditoriasDTO;
    }

    // Obtener cambios por usuario en rango de fechas
    public List<clsDTOAuditoriaReserva> obtenerCambiosPorUsuario(Integer usuarioCambio, 
                                                               LocalDateTime fechaInicio, 
                                                               LocalDateTime fechaFin) {
        List<clsDTOAuditoriaReserva> auditoriasDTO = new ArrayList<>();
        List<clsEntidadAuditoriaReserva> auditorias = clsRepositorioAuditoriaReserva.findByUsuarioAndFechaRange(
            usuarioCambio, fechaInicio, fechaFin
        );
        
        for (clsEntidadAuditoriaReserva auditoria : auditorias) {
            clsDTOAuditoriaReserva dto = convertirAUDTO(auditoria);
            auditoriasDTO.add(dto);
        }
        
        return auditoriasDTO;
    }

    // Convertir entidad a DTO con información adicional
    private clsDTOAuditoriaReserva convertirAUDTO(clsEntidadAuditoriaReserva auditoria) {
        clsDTOAuditoriaReserva dto = new clsDTOAuditoriaReserva();
        dto.setIdAudit(auditoria.getIdAudit());
        dto.setIdReserva(auditoria.getIdReserva());
        dto.setEstadoAnterior(auditoria.getEstadoAnterior());
        dto.setEstadoNuevo(auditoria.getEstadoNuevo());
        dto.setFechaCambio(auditoria.getFechaCambio());
        dto.setUsuarioCambio(auditoria.getUsuarioCambio());
        
        // Obtener información adicional de la reserva
        Optional<clsEntidadReserva> reservaOpt = clsRepositorioReserva.findById(auditoria.getIdReserva());
        if (reservaOpt.isPresent()) {
            clsEntidadReserva reserva = reservaOpt.get();
            if (reserva.getEspacio() != null) {
                dto.setEspacioReserva(reserva.getEspacio().getNombre());
            }
            
            // Obtener información del solicitante
            if (reserva.getUsuario() != null) {
                dto.setSolicitanteReserva(reserva.getUsuario().getNombre() + " " + reserva.getUsuario().getApellido());
            }
        }
        
        // Obtener información del usuario que realizó el cambio
        Optional<clsEntidadUsuario> usuarioOpt = clsRepositorioUsuario.findById(auditoria.getUsuarioCambio());
        if (usuarioOpt.isPresent()) {
            clsEntidadUsuario usuario = usuarioOpt.get();
            dto.setNombreUsuario(usuario.getNombres() + " " + usuario.getApellidos());
        } else {
            dto.setNombreUsuario("Usuario " + auditoria.getUsuarioCambio());
        }
        
        return dto;
    }

    // Método para obtener todas las auditorías con información completa
    public List<clsDTOAuditoriaReserva> obtenerTodasAuditoriasCompletas() {
        List<clsDTOAuditoriaReserva> auditoriasDTO = new ArrayList<>();
        List<clsEntidadAuditoriaReserva> auditorias = clsRepositorioAuditoriaReserva.findAllWithDetails();
        
        for (clsEntidadAuditoriaReserva auditoria : auditorias) {
            clsDTOAuditoriaReserva dto = convertirAUDTOCompleto(auditoria);
            auditoriasDTO.add(dto);
        }
        
        return auditoriasDTO;
    }

    // Convertir entidad a DTO con información completa de las relaciones
    private clsDTOAuditoriaReserva convertirAUDTOCompleto(clsEntidadAuditoriaReserva auditoria) {
        clsDTOAuditoriaReserva dto = convertirAUDTO(auditoria);
        
        // Si ya tenemos las relaciones cargadas, usar esa información
        if (auditoria.getReserva() != null && auditoria.getReserva().getEspacio() != null) {
            dto.setEspacioReserva(auditoria.getReserva().getEspacio().getNombre());
        }
        
        if (auditoria.getReserva() != null && auditoria.getReserva().getUsuario() != null) {
            dto.setSolicitanteReserva(auditoria.getReserva().getUsuario().getNombre() + " " + 
                                    auditoria.getReserva().getUsuario().getApellido());
        }
        
        if (auditoria.getUsuario() != null) {
            dto.setNombreUsuario(auditoria.getUsuario().getNombres() + " " + auditoria.getUsuario().getApellidos());
        }
        
        return dto;
    }

    // Verificar si existe auditoría para una reserva
    public boolean existeAuditoriaParaReserva(Integer idReserva) {
        List<clsEntidadAuditoriaReserva> auditorias = clsRepositorioAuditoriaReserva.findByIdReserva(idReserva);
        return !auditorias.isEmpty();
    }

    // Obtener cantidad de cambios por reserva
    public Long contarCambiosPorReserva(Integer idReserva) {
        List<clsEntidadAuditoriaReserva> auditorias = clsRepositorioAuditoriaReserva.findByIdReserva(idReserva);
        return (long) auditorias.size();
    }

    // Eliminar auditoría por ID (solo para administración)
    public boolean eliminarAuditoria(Integer idAudit) {
        if (clsRepositorioAuditoriaReserva.existsById(idAudit)) {
            clsRepositorioAuditoriaReserva.deleteById(idAudit);
            return true;
        }
        return false;
    }

    // Obtener IDs de reserva únicos
    public List<Integer> obtenerIdsReservaUnicos() {
        return clsRepositorioAuditoriaReserva.findDistinctIdReserva();
    }

    // Obtener usuarios únicos que han realizado cambios
    public List<Integer> obtenerUsuariosCambioUnicos() {
        return clsRepositorioAuditoriaReserva.findDistinctUsuarioCambio();
    }

    // Obtener todas las auditorías usando la consulta personalizada
    public List<clsDTOAuditoriaReserva> obtenerTodasAuditoriasDTO() {
        return clsRepositorioAuditoriaReserva.findAllAuditoriaReservas();
    }

    // Obtener auditorías por ID de reserva usando consulta personalizada
    public List<clsDTOAuditoriaReserva> obtenerAuditoriasDTOPorReserva(Integer idReserva) {
        return clsRepositorioAuditoriaReserva.findAuditoriasByReserva(idReserva);
    }

    // Método para limpiar auditorías antiguas (más de 1 año)
    public int limpiarAuditoriasAntiguas() {
        LocalDateTime fechaLimite = LocalDateTime.now().minusYears(1);
        List<clsEntidadAuditoriaReserva> auditoriasAntiguas = clsRepositorioAuditoriaReserva.findByFechaCambioBefore(fechaLimite);
        
        int cantidadEliminada = auditoriasAntiguas.size();
        clsRepositorioAuditoriaReserva.deleteAll(auditoriasAntiguas);
        
        return cantidadEliminada;
    }

    // Método para obtener resumen de cambios por mes
    public Map<String, Long> obtenerResumenMensual(int año) {
        LocalDateTime inicioAño = LocalDateTime.of(año, 1, 1, 0, 0);
        LocalDateTime finAño = LocalDateTime.of(año, 12, 31, 23, 59);
        
        List<clsEntidadAuditoriaReserva> auditoriasDelAño = clsRepositorioAuditoriaReserva.findByFechaCambioBetween(inicioAño, finAño);
        
        Map<String, Long> resumenMensual = new HashMap<>();
        for (int mes = 1; mes <= 12; mes++) {
            final int mesActual = mes;
            long cantidad = auditoriasDelAño.stream()
                .filter(a -> a.getFechaCambio().getMonthValue() == mesActual)
                .count();
            resumenMensual.put(String.valueOf(mes), cantidad);
        }
        
        return resumenMensual;
    }
}