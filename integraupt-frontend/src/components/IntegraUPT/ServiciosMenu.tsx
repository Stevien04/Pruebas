import React from 'react';
import { Server, MessageCircle } from 'lucide-react';

interface ServiciosMenuProps {
  onSelectEspacios: () => void;
  onSelectCitas: () => void;
}

export const ServiciosMenu: React.FC<ServiciosMenuProps> = ({
  onSelectEspacios,
  onSelectCitas
}) => {
  return (
    <div>
      <div className="servicios-header">
        <h1 className="servicios-title">Servicios</h1>
        <p className="servicios-subtitle">Selecciona el servicio que necesitas</p>
      </div>

      <div className="servicios-menu-grid">
        <button
          onClick={onSelectEspacios}
          className="servicios-menu-card servicios-menu-card-espacios"
        >
          <div className="servicios-menu-icon-container">
            <div className="servicios-menu-icon servicios-menu-icon-espacios">
              <Server className="servicios-menu-icon-svg" />
            </div>
          </div>
          <h3 className="servicios-menu-card-title">Reserva de Espacios</h3>
          <p className="servicios-menu-card-description">
            Reserva laboratorios y aulas para tus actividades académicas
          </p>
          <div className="servicios-menu-card-badge">
            Laboratorios y Aulas
          </div>
        </button>

        <button
          onClick={onSelectCitas}
          className="servicios-menu-card servicios-menu-card-citas"
        >
          <div className="servicios-menu-icon-container">
            <div className="servicios-menu-icon servicios-menu-icon-citas">
              <MessageCircle className="servicios-menu-icon-svg" />
            </div>
          </div>
          <h3 className="servicios-menu-card-title">Citas y Asesorías</h3>
          <p className="servicios-menu-card-description">
            Agenda tu cita de orientación psicológica personalizada
          </p>
          <div className="servicios-menu-card-badge servicios-menu-card-badge-citas">
            Orientación Psicológica
          </div>
        </button>
      </div>
    </div>
  );
};
