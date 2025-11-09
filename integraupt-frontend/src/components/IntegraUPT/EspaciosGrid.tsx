import React from 'react';
import {
  ArrowLeft,
  Calendar,
  ClipboardList,
  Eye,
  Server,
  Monitor,
  Building2,
  BookOpen,
  MapPin,
  Users as UsersIcon
} from 'lucide-react';

import type { Espacio } from './types';

interface EspaciosGridProps {
  espacios: Espacio[];
  onBack: () => void;
  onVerHorario: (espacio: Espacio) => void;
  onReservar: (espacio: Espacio) => void;
  onShowReservas: () => void;
}

export const EspaciosGrid: React.FC<EspaciosGridProps> = ({
  espacios,
  onBack,
  onVerHorario,
  onReservar,
  onShowReservas
}) => {
  return (
    <div>
      <button onClick={onBack} className="servicios-back-btn">
        <ArrowLeft className="servicios-back-icon" />
        Volver a Servicios
      </button>

      <div className="servicios-espacios-header">
        <div className="servicios-header">
          <h1 className="servicios-title">Espacios Disponibles</h1>
          <p className="servicios-subtitle">Selecciona un espacio para ver su horario semanal</p>
        </div>
        <button
          onClick={onShowReservas}
          className="servicios-action-btn servicios-action-btn-info servicios-estado-inline-btn"
        >
          <ClipboardList className="servicios-action-btn-icon" />
          Mis reservas
        </button>
      </div>

      <div className="servicios-espacios-grid">
        {espacios.map((espacio) => (
          <div
            key={espacio.id}
            className={`servicios-espacio-card ${
              espacio.estado === 'Disponible'
                ? 'servicios-espacio-disponible'
                : 'servicios-espacio-mantenimiento'
            }`}
          >
            <div className="servicios-espacio-header">
              <div className="servicios-espacio-info">
                <div
                  className={`servicios-espacio-icon ${
                    espacio.tipo === 'Laboratorio'
                      ? 'servicios-espacio-lab'
                      : 'servicios-espacio-aula'
                  }`}
                >
                  {espacio.tipo === 'Laboratorio' ? (
                    <Server className="servicios-espacio-icon-svg" />
                  ) : (
                    <Monitor className="servicios-espacio-icon-svg" />
                  )}
                </div>
                <div>
                  <h3 className="servicios-espacio-name">{espacio.nombre}</h3>
                  <span
                    className={`servicios-espacio-tipo ${
                      espacio.tipo === 'Laboratorio'
                        ? 'servicios-espacio-tipo-lab'
                        : 'servicios-espacio-tipo-aula'
                    }`}
                  >
                    {espacio.tipo}
                  </span>
                </div>
              </div>
            </div>

            <div className="servicios-espacio-details">
              <div className="servicios-espacio-detail">
                <Building2 className="servicios-espacio-detail-icon" />
                <span>{espacio.facultad}</span>
              </div>
              <div className="servicios-espacio-detail">
                <BookOpen className="servicios-espacio-detail-icon" />
                <span>{espacio.escuela}</span>
              </div>
              <div className="servicios-espacio-detail">
                <MapPin className="servicios-espacio-detail-icon" />
                <span>{espacio.ubicacion}</span>
              </div>
              <div className="servicios-espacio-detail">
                <UsersIcon className="servicios-espacio-detail-icon" />
                <span>Capacidad: {espacio.capacidad}</span>
              </div>
            </div>

            <div className="servicios-espacio-recursos">
              <p className="servicios-espacio-recursos-label">Recursos:</p>
              <p className="servicios-espacio-recursos-text">{espacio.equipamiento}</p>
            </div>

            <div className="servicios-espacio-actions">
              <div className="servicios-espacio-status-container">
                <span
                  className={`servicios-espacio-status ${
                    espacio.estado === 'Disponible'
                      ? 'servicios-espacio-status-disponible'
                      : 'servicios-espacio-status-mantenimiento'
                  }`}
                >
                  {espacio.estado}
                </span>

                <button
                  onClick={() => onVerHorario(espacio)}
                  className="servicios-espacio-btn servicios-espacio-btn-horario"
                >
                  <Eye className="servicios-espacio-btn-icon" />
                  Ver Horario
                </button>
              </div>

              {espacio.estado === 'Disponible' && (
                <button
                  onClick={() => onReservar(espacio)}
                  className="servicios-espacio-btn servicios-espacio-btn-reservar"
                >
                  <Calendar className="servicios-espacio-btn-icon" />
                  Reservar Espacio
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};