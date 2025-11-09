package com.integraupt.dto;

import java.time.LocalDateTime;

public class clsDTOAuditoriaReserva {
    private Integer idAudit;
    private Integer idReserva;
    private String estadoAnterior;
    private String estadoNuevo;
    private LocalDateTime fechaCambio;
    private Integer usuarioCambio;
    private String nombreUsuario;
    private String espacioReserva;
    private String solicitanteReserva;
    
    // Constructores
    public clsDTOAuditoriaReserva() {}
    
    public clsDTOAuditoriaReserva(Integer idAudit, Integer idReserva, String estadoAnterior, 
                                 String estadoNuevo, LocalDateTime fechaCambio, Integer usuarioCambio) {
        this.idAudit = idAudit;
        this.idReserva = idReserva;
        this.estadoAnterior = estadoAnterior;
        this.estadoNuevo = estadoNuevo;
        this.fechaCambio = fechaCambio;
        this.usuarioCambio = usuarioCambio;
    }

    // Getters y Setters
    public Integer getIdAudit() { return idAudit; }
    public void setIdAudit(Integer idAudit) { this.idAudit = idAudit; }
    
    public Integer getIdReserva() { return idReserva; }
    public void setIdReserva(Integer idReserva) { this.idReserva = idReserva; }
    
    public String getEstadoAnterior() { return estadoAnterior; }
    public void setEstadoAnterior(String estadoAnterior) { this.estadoAnterior = estadoAnterior; }
    
    public String getEstadoNuevo() { return estadoNuevo; }
    public void setEstadoNuevo(String estadoNuevo) { this.estadoNuevo = estadoNuevo; }
    
    public LocalDateTime getFechaCambio() { return fechaCambio; }
    public void setFechaCambio(LocalDateTime fechaCambio) { this.fechaCambio = fechaCambio; }
    
    public Integer getUsuarioCambio() { return usuarioCambio; }
    public void setUsuarioCambio(Integer usuarioCambio) { this.usuarioCambio = usuarioCambio; }
    
    public String getNombreUsuario() { return nombreUsuario; }
    public void setNombreUsuario(String nombreUsuario) { this.nombreUsuario = nombreUsuario; }
    
    public String getEspacioReserva() { return espacioReserva; }
    public void setEspacioReserva(String espacioReserva) { this.espacioReserva = espacioReserva; }
    
    public String getSolicitanteReserva() { return solicitanteReserva; }
    public void setSolicitanteReserva(String solicitanteReserva) { this.solicitanteReserva = solicitanteReserva; }
}