package com.integraupt.repositorio;

import com.integraupt.dto.clsDTOAuditoriaReserva;
import com.integraupt.entidad.clsEntidadAuditoriaReserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface clsRepositorioAuditoriaReserva extends JpaRepository<clsEntidadAuditoriaReserva, Integer> {
    
    // Buscar por ID de reserva
    List<clsEntidadAuditoriaReserva> findByIdReserva(Integer idReserva);
    
    // Buscar por usuario que realizó el cambio
    List<clsEntidadAuditoriaReserva> findByUsuarioCambio(Integer usuarioCambio);
    
    // Buscar por rango de fechas
    List<clsEntidadAuditoriaReserva> findByFechaCambioBetween(LocalDateTime fechaInicio, LocalDateTime fechaFin);
    
    // Buscar por estado anterior
    List<clsEntidadAuditoriaReserva> findByEstadoAnterior(String estadoAnterior);
    
    // Buscar por estado nuevo
    List<clsEntidadAuditoriaReserva> findByEstadoNuevo(String estadoNuevo);
    
    // Buscar por fecha anterior a
    List<clsEntidadAuditoriaReserva> findByFechaCambioBefore(LocalDateTime fecha);
    
    // Consulta personalizada para obtener datos completos con joins
    @Query("SELECT new com.integraupt.dto.clsDTOAuditoriaReserva(" +
           "a.idAudit, a.idReserva, a.estadoAnterior, a.estadoNuevo, a.fechaCambio, a.usuarioCambio) " +
           "FROM clsEntidadAuditoriaReserva a " +
           "ORDER BY a.fechaCambio DESC")
    List<clsDTOAuditoriaReserva> findAllAuditoriaReservas();
    
    // Consulta con filtros múltiples
    @Query("SELECT a FROM clsEntidadAuditoriaReserva a WHERE " +
           "(:idReserva IS NULL OR a.idReserva = :idReserva) AND " +
           "(:usuarioCambio IS NULL OR a.usuarioCambio = :usuarioCambio) AND " +
           "(:estadoAnterior IS NULL OR a.estadoAnterior = :estadoAnterior) AND " +
           "(:estadoNuevo IS NULL OR a.estadoNuevo = :estadoNuevo) AND " +
           "(:fechaInicio IS NULL OR a.fechaCambio >= :fechaInicio) AND " +
           "(:fechaFin IS NULL OR a.fechaCambio <= :fechaFin) " +
           "ORDER BY a.fechaCambio DESC")
    List<clsEntidadAuditoriaReserva> findWithFilters(
            @Param("idReserva") Integer idReserva,
            @Param("usuarioCambio") Integer usuarioCambio,
            @Param("estadoAnterior") String estadoAnterior,
            @Param("estadoNuevo") String estadoNuevo,
            @Param("fechaInicio") LocalDateTime fechaInicio,
            @Param("fechaFin") LocalDateTime fechaFin);

    // Consulta para obtener auditorías con información de reserva y usuario
    @Query("SELECT a FROM clsEntidadAuditoriaReserva a " +
           "LEFT JOIN FETCH a.reserva r " +
           "LEFT JOIN FETCH a.usuario u " +
           "ORDER BY a.fechaCambio DESC")
    List<clsEntidadAuditoriaReserva> findAllWithDetails();

    // Consulta para contar cambios por estado
    @Query("SELECT a.estadoNuevo, COUNT(a) FROM clsEntidadAuditoriaReserva a GROUP BY a.estadoNuevo")
    List<Object[]> countByEstadoNuevo();

    // Consulta para obtener cambios recientes (últimos 7 días)
    @Query("SELECT a FROM clsEntidadAuditoriaReserva a WHERE a.fechaCambio >= :fechaInicio ORDER BY a.fechaCambio DESC")
    List<clsEntidadAuditoriaReserva> findRecentChanges(@Param("fechaInicio") LocalDateTime fechaInicio);

    // Consulta para buscar por texto en estados
    @Query("SELECT a FROM clsEntidadAuditoriaReserva a WHERE " +
           "LOWER(a.estadoAnterior) LIKE LOWER(CONCAT('%', :texto, '%')) OR " +
           "LOWER(a.estadoNuevo) LIKE LOWER(CONCAT('%', :texto, '%')) " +
           "ORDER BY a.fechaCambio DESC")
    List<clsEntidadAuditoriaReserva> findByTextoEnEstados(@Param("texto") String texto);

    // Consulta para obtener estadísticas por día
    @Query("SELECT DATE(a.fechaCambio), COUNT(a) FROM clsEntidadAuditoriaReserva a " +
           "WHERE a.fechaCambio BETWEEN :fechaInicio AND :fechaFin " +
           "GROUP BY DATE(a.fechaCambio) " +
           "ORDER BY DATE(a.fechaCambio) DESC")
    List<Object[]> findEstadisticasPorDia(@Param("fechaInicio") LocalDateTime fechaInicio, 
                                         @Param("fechaFin") LocalDateTime fechaFin);

    // Consulta para obtener el último cambio de una reserva específica
    @Query("SELECT a FROM clsEntidadAuditoriaReserva a WHERE a.idReserva = :idReserva " +
           "ORDER BY a.fechaCambio DESC LIMIT 1")
    clsEntidadAuditoriaReserva findUltimoCambioPorReserva(@Param("idReserva") Integer idReserva);

    // Consulta para obtener cambios por usuario en un rango de fechas
    @Query("SELECT a FROM clsEntidadAuditoriaReserva a WHERE " +
           "a.usuarioCambio = :usuarioCambio AND " +
           "a.fechaCambio BETWEEN :fechaInicio AND :fechaFin " +
           "ORDER BY a.fechaCambio DESC")
    List<clsEntidadAuditoriaReserva> findByUsuarioAndFechaRange(
            @Param("usuarioCambio") Integer usuarioCambio,
            @Param("fechaInicio") LocalDateTime fechaInicio,
            @Param("fechaFin") LocalDateTime fechaFin);

    // Consulta para obtener el total de registros de auditoría
    @Query("SELECT COUNT(a) FROM clsEntidadAuditoriaReserva a")
    Long countTotalRegistros();

    // Consulta para obtener cambios por tipo de estado (aprobaciones, cancelaciones, etc.)
    @Query("SELECT COUNT(a) FROM clsEntidadAuditoriaReserva a WHERE a.estadoNuevo = :estado")
    Long countByEstado(@Param("estado") String estado);

    // Consulta para obtener auditorías con información completa para DTO
    @Query("SELECT new com.integraupt.dto.clsDTOAuditoriaReserva(" +
           "a.idAudit, a.idReserva, a.estadoAnterior, a.estadoNuevo, a.fechaCambio, a.usuarioCambio) " +
           "FROM clsEntidadAuditoriaReserva a " +
           "WHERE (:idReserva IS NULL OR a.idReserva = :idReserva) " +
           "ORDER BY a.fechaCambio DESC")
    List<clsDTOAuditoriaReserva> findAuditoriasByReserva(@Param("idReserva") Integer idReserva);

    // Consulta para obtener todos los IDs de reserva que tienen auditoría
    @Query("SELECT DISTINCT a.idReserva FROM clsEntidadAuditoriaReserva a ORDER BY a.idReserva")
    List<Integer> findDistinctIdReserva();

    // Consulta para obtener usuarios únicos que han realizado cambios
    @Query("SELECT DISTINCT a.usuarioCambio FROM clsEntidadAuditoriaReserva a ORDER BY a.usuarioCambio")
    List<Integer> findDistinctUsuarioCambio();

    // Consulta para obtener el total de cambios por mes
    @Query("SELECT MONTH(a.fechaCambio), COUNT(a) FROM clsEntidadAuditoriaReserva a " +
           "WHERE YEAR(a.fechaCambio) = :año " +
           "GROUP BY MONTH(a.fechaCambio) " +
           "ORDER BY MONTH(a.fechaCambio)")
    List<Object[]> findTotalPorMes(@Param("año") int año);
}