package com.integraupt.entidad;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "auditoriareserva")
public class clsEntidadAuditoriaReserva {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdAudit")
    private Integer idAudit;
    
    @Column(name = "IdReserva", nullable = false)
    private Integer idReserva;
    
    @Column(name = "EstadoAnterior", length = 50)
    private String estadoAnterior;
    
    @Column(name = "EstadoNuevo", length = 50)
    private String estadoNuevo;
    
    @Column(name = "FechaCambio")
    private LocalDateTime fechaCambio;
    
    @Column(name = "UsuarioCambio")
    private Integer usuarioCambio;
    
    // Relación opcional con Reserva
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdReserva", insertable = false, updatable = false)
    private clsEntidadReserva reserva;
    
    // Relación opcional con Usuario
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "UsuarioCambio", insertable = false, updatable = false)
    private clsEntidadUsuario usuario;

    // Constructores
    public clsEntidadAuditoriaReserva() {}
    
    public clsEntidadAuditoriaReserva(Integer idReserva, String estadoAnterior, String estadoNuevo, Integer usuarioCambio) {
        this.idReserva = idReserva;
        this.estadoAnterior = estadoAnterior;
        this.estadoNuevo = estadoNuevo;
        this.usuarioCambio = usuarioCambio;
        this.fechaCambio = LocalDateTime.now();
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
    
    public clsEntidadReserva getReserva() { return reserva; }
    public void setReserva(clsEntidadReserva reserva) { this.reserva = reserva; }
    
    public clsEntidadUsuario getUsuario() { return usuario; }
    public void setUsuario(clsEntidadUsuario usuario) { this.usuario = usuario; }

    // Método toString para debugging
    @Override
    public String toString() {
        return "clsEntidadAuditoriaReserva{" +
                "idAudit=" + idAudit +
                ", idReserva=" + idReserva +
                ", estadoAnterior='" + estadoAnterior + '\'' +
                ", estadoNuevo='" + estadoNuevo + '\'' +
                ", fechaCambio=" + fechaCambio +
                ", usuarioCambio=" + usuarioCambio +
                '}';
    }
}