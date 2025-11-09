import React, { useMemo } from 'react';
import { ArrowLeft, Clock } from 'lucide-react';

import type { Espacio } from './types';
import type { HorarioCompleto } from './services/serviciosScreenService';
import type { BloqueHorarioCatalogoMap } from './services/horariosService';

interface BloqueHorario {
  id: number;
  label: string;
  horaInicio: string;
  horaFinal: string;
  orden: number;
}

interface HorarioSemanalProps {
  espacio: Espacio;
  horarios: HorarioCompleto[];
  bloquesCatalogo: BloqueHorarioCatalogoMap;
  ordenBloques: Map<number, number>;
  bloquesError: string | null;
  horariosCargando: boolean;
  onBack: () => void;
}

const formatearHora = (hora?: string | null) => {
  if (!hora || hora === 'N/A') {
    return 'N/A';
  }

  const match = hora.match(/^(\d{1,2}):(\d{2})/);
  if (match) {
    const horas = match[1].padStart(2, '0');
    const minutos = match[2];
    return `${horas}:${minutos}`;
  }

  return hora;
};

const normalizarDia = (dia: string) =>
  dia
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

export const HorarioSemanal: React.FC<HorarioSemanalProps> = ({
  espacio,
  horarios,
  bloquesCatalogo,
  ordenBloques,
  bloquesError,
  horariosCargando,
  onBack
}) => {
  const diasTabla = useMemo(
    () => [
      { clave: 'Lunes', etiqueta: 'Lunes' },
      { clave: 'Martes', etiqueta: 'Martes' },
      { clave: 'Miercoles', etiqueta: 'Miércoles' },
      { clave: 'Jueves', etiqueta: 'Jueves' },
      { clave: 'Viernes', etiqueta: 'Viernes' },
      { clave: 'Sabado', etiqueta: 'Sábado' }
    ],
    []
  );

  const bloquesDisponibles = useMemo(() => {
    if (!horarios.length) {
      return [] as BloqueHorario[];
    }

    const mapaBloques = new Map<number, BloqueHorario>();

    horarios.forEach((horario) => {
      if (!mapaBloques.has(horario.bloqueId)) {
        const bloqueCatalogo = bloquesCatalogo[horario.bloqueId];
        const horaInicioCatalogo = formatearHora(bloqueCatalogo?.horaInicio || horario.horaInicio);
        const horaFinalCatalogo = formatearHora(bloqueCatalogo?.horaFinal || horario.horaFinal);

        mapaBloques.set(horario.bloqueId, {
          id: horario.bloqueId,
          label: `${horaInicioCatalogo} a ${horaFinalCatalogo}`,
          horaInicio: horaInicioCatalogo,
          horaFinal: horaFinalCatalogo,
          orden: bloqueCatalogo?.orden ?? ordenBloques.get(horario.bloqueId) ?? horario.bloqueId
        });
      }
    });

    return Array.from(mapaBloques.values()).sort((a, b) => {
      if (a.orden !== b.orden) {
        return a.orden - b.orden;
      }

      if (a.horaInicio !== 'N/A' && b.horaInicio !== 'N/A') {
        return a.horaInicio.localeCompare(b.horaInicio);
      }

      return a.id - b.id;
    });
  }, [horarios, bloquesCatalogo, ordenBloques]);

  const obtenerHorarioParaCelda = useMemo(() => {
    return (dia: string, bloqueId: number) => {
      if (!horarios.length) {
        return null;
      }

      const diaNormalizado = normalizarDia(dia);

      return (
        horarios.find(
          (horario) =>
            horario.bloqueId === bloqueId &&
            normalizarDia(horario.diaSemana) === diaNormalizado
        ) || null
      );
    };
  }, [horarios]);

  return (
    <div>
      <button onClick={onBack} className="servicios-back-btn">
        <ArrowLeft className="servicios-back-icon" />
        Volver a Espacios
      </button>

      <div className="servicios-espacio-info-card">
        <div className="servicios-espacio-info-header">
          <div>
            <h1 className="servicios-espacio-info-title">{espacio.nombre}</h1>
            <div className="servicios-espacio-info-badges">
              <span
                className={`servicios-espacio-info-badge ${
                  espacio.tipo === 'Laboratorio'
                    ? 'servicios-espacio-info-badge-lab'
                    : 'servicios-espacio-info-badge-aula'
                }`}
              >
                {espacio.tipo}
              </span>
              <span className="servicios-espacio-info-badge servicios-espacio-info-badge-facultad">
                {espacio.facultad} - {espacio.escuela}
              </span>
              <span className="servicios-espacio-info-badge servicios-espacio-info-badge-capacidad">
                Capacidad: {espacio.capacidad}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="servicios-horario-container">
        <h3 className="servicios-horario-title">
          <Clock className="servicios-horario-title-icon" />
          Horario Semanal (Bloques de 50 minutos)
          {horariosCargando && <span className="servicios-loading-text">Cargando horarios...</span>}
        </h3>

        {horariosCargando ? (
          <div className="servicios-horario-loading">
            <div className="servicios-loading-spinner"></div>
            <p>Cargando horarios del espacio...</p>
          </div>
        ) : (
          <>
            {bloquesError && <div className="servicios-horario-error">{bloquesError}</div>}
            <div className="servicios-horario-table-container">
              {bloquesDisponibles.length === 0 ? (
                <div className="servicios-horario-empty">
                  No se encontraron bloques de horarios configurados para este espacio.
                </div>
              ) : (
                <table className="servicios-horario-table">
                  <thead>
                    <tr className="servicios-horario-header">
                      <th className="servicios-horario-th servicios-horario-time-header">Horario</th>
                      {diasTabla.map((dia) => (
                        <th key={dia.clave} className="servicios-horario-th">
                          {dia.etiqueta}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bloquesDisponibles.map((bloque) => (
                      <tr key={bloque.id} className="servicios-horario-row">
                        <td className="servicios-horario-time">{bloque.label}</td>
                        {diasTabla.map((dia) => {
                          const horarioCelda = obtenerHorarioParaCelda(dia.clave, bloque.id);
                          const estaOcupado = Boolean(horarioCelda?.ocupado);
                          const horaInicioCelda = formatearHora(horarioCelda?.horaInicio);
                          const horaFinalCelda = formatearHora(horarioCelda?.horaFinal);

                          return (
                            <td
                              key={`${dia.clave}-${bloque.id}`}
                              className={`servicios-horario-cell ${
                                estaOcupado
                                  ? 'servicios-horario-cell-ocupado'
                                  : 'servicios-horario-cell-disponible'
                              }`}
                            >
                              {estaOcupado && horarioCelda ? (
                                <div className="servicios-horario-curso">
                                  <div className="servicios-horario-curso-nombre">
                                    {horarioCelda.curso || 'Bloque reservado'}
                                  </div>
                                  {horarioCelda.curso && (
                                    <div className="servicios-horario-curso-profesor">
                                      {horarioCelda.docente || 'Docente no asignado'}
                                    </div>
                                  )}
                                  {(horaInicioCelda !== 'N/A' || horaFinalCelda !== 'N/A') && (
                                    <div className="servicios-horario-curso-estudiantes">
                                      {horaInicioCelda} - {horaFinalCelda}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="servicios-horario-vacio">Disponible</div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="servicios-horario-leyenda">
              <div className="servicios-horario-leyenda-items">
                <div className="servicios-horario-leyenda-item">
                  <div className="servicios-horario-leyenda-color servicios-horario-leyenda-ocupado"></div>
                  <span className="servicios-horario-leyenda-text">Ocupado</span>
                </div>
                <div className="servicios-horario-leyenda-item">
                  <div className="servicios-horario-leyenda-color servicios-horario-leyenda-disponible"></div>
                  <span className="servicios-horario-leyenda-text">Disponible</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};