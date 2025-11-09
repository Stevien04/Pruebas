import React from 'react';
import { Check, X } from 'lucide-react';

import type { Espacio } from './types';

export interface EspaciosFormState {
  type: 'laboratorio' | 'aula';
  resource: string;
  date: string;
  bloqueId: string;
  startTime: string;
  endTime: string;
  ciclo: string;
  curso: string;
}

export interface ReservaRapidaFormState {
  ciclo: string;
  curso: string;
  date: string;
  bloqueId: string;
  startTime: string;
  endTime: string;
  motivo: string;
}

export interface BloqueHorarioOption {
  id: number;
  label: string;
  horaInicio: string;
  horaFinal: string;
  orden: number;
}

interface ReservaModalProps {
  visible: boolean;
  espacio: Espacio | null;
  form: ReservaRapidaFormState;
  onChange: (updates: Partial<ReservaRapidaFormState>) => void;
  onSubmit: () => void;
  onClose: () => void;
  loading: boolean;
  error: string | null;
  success: string | null;
  bloques: BloqueHorarioOption[];
  bloquesCargando: boolean;
  bloquesError: string | null;
}

interface ReservaFormProps {
  espacios: Espacio[];
  espaciosForm: EspaciosFormState;
  onChangeEspaciosForm: (updates: Partial<EspaciosFormState>) => void;
  onSubmitEspaciosForm: () => void;
  onCancel: () => void;
  loading: boolean;
  formSuccessMessage: string | null;
  reservaModal: ReservaModalProps;
  showForm?: boolean;
}

const hoy = new Date().toISOString().split('T')[0];

export const ReservaForm: React.FC<ReservaFormProps> = ({
  espacios,
  espaciosForm,
  onChangeEspaciosForm,
  onSubmitEspaciosForm,
  onCancel,
  loading,
  formSuccessMessage,
  reservaModal,
  showForm = true
}) => {
  const filteredEspacios = espacios.filter(
    (espacio) => espacio.tipo === (espaciosForm.type === 'laboratorio' ? 'Laboratorio' : 'Aula')
  );

  const handleEspaciosFormChange = (field: keyof EspaciosFormState) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    onChangeEspaciosForm({ [field]: event.target.value } as Partial<EspaciosFormState>);
  };

  const handleReservaModalChange = (
    field: keyof ReservaRapidaFormState,
    value: string
  ) => {
    reservaModal.onChange({ [field]: value });
  };

  const handleBloqueChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;

    if (!value) {
      reservaModal.onChange({ bloqueId: '', startTime: '', endTime: '' });
      return;
    }

    const bloqueSeleccionado = reservaModal.bloques.find((bloque) => bloque.id === Number(value));

    reservaModal.onChange({
      bloqueId: value,
      startTime: bloqueSeleccionado ? bloqueSeleccionado.horaInicio : '',
      endTime: bloqueSeleccionado ? bloqueSeleccionado.horaFinal : ''
    });
  };

  return (
    <>
      {showForm && (
        <div className="servicios-form-container">
          <div className="servicios-form-header">
            <h2 className="servicios-form-title">Nueva Reserva de Espacio</h2>
            <button onClick={onCancel} className="servicios-form-close">
              <X className="servicios-form-close-icon" />
            </button>
          </div>

          {formSuccessMessage && <div className="servicios-form-success">{formSuccessMessage}</div>}

          <form
            onSubmit={(event) => {
              event.preventDefault();
              onSubmitEspaciosForm();
            }}
            className="servicios-form"
          >
            <div className="servicios-form-group">
              <label className="servicios-form-label">Tipo de Espacio</label>
              <select
                value={espaciosForm.type}
                onChange={(event) => onChangeEspaciosForm({ type: event.target.value as 'laboratorio' | 'aula' })}
                className="servicios-form-select"
                required
              >
                <option value="laboratorio">Laboratorio</option>
                <option value="aula">Aula</option>
              </select>
            </div>

            <div className="servicios-form-group">
              <label className="servicios-form-label">
                {espaciosForm.type === 'laboratorio' ? 'Laboratorio' : 'Aula'}
              </label>
              <select
                value={espaciosForm.resource}
                onChange={(event) => onChangeEspaciosForm({ resource: event.target.value })}
                className="servicios-form-select"
                required
              >
                <option value="">
                  Selecciona {espaciosForm.type === 'laboratorio' ? 'un laboratorio' : 'un aula'}
                </option>
                {filteredEspacios.map((espacio) => (
                  <option key={espacio.id} value={espacio.nombre}>
                    {espacio.nombre} - {espacio.ubicacion}
                  </option>
                ))}
              </select>
            </div>

            <div className="servicios-form-grid">
              <div className="servicios-form-group">
                <label className="servicios-form-label">Ciclo *</label>
                <select
                  value={espaciosForm.ciclo}
                  onChange={handleEspaciosFormChange('ciclo')}
                  className="servicios-form-select"
                  required
                >
                  <option value="">Selecciona ciclo</option>
                  {['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="servicios-form-group">
                <label className="servicios-form-label">Curso / Tema *</label>
                <input
                  type="text"
                  value={espaciosForm.curso}
                  onChange={handleEspaciosFormChange('curso')}
                  placeholder="Ej: Programación Avanzada"
                  className="servicios-form-input"
                  required
                />
              </div>
            </div>

            <div className="servicios-form-group">
              <label className="servicios-form-label">Fecha</label>
              <input
                type="date"
                value={espaciosForm.date}
                onChange={handleEspaciosFormChange('date')}
                min={hoy}
                className="servicios-form-input"
                required
              />
            </div>

            <div className="servicios-form-grid">
              <div className="servicios-form-group">
                <label className="servicios-form-label">Hora Inicio</label>
                <input
                  type="time"
                  value={espaciosForm.startTime}
                  onChange={handleEspaciosFormChange('startTime')}
                  className="servicios-form-input"
                  required
                />
              </div>
              <div className="servicios-form-group">
                <label className="servicios-form-label">Hora Fin</label>
                <input
                  type="time"
                  value={espaciosForm.endTime}
                  onChange={handleEspaciosFormChange('endTime')}
                  className="servicios-form-input"
                  required
                />
              </div>
            </div>

            <div className="servicios-form-actions">
              <button
                type="submit"
                className="servicios-form-btn servicios-form-btn-primary"
                disabled={loading}
              >
                <Check className="servicios-form-btn-icon" />
                {loading ? 'Creando...' : 'Crear Reserva'}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="servicios-form-btn servicios-form-btn-secondary"
                disabled={loading}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {reservaModal.visible && reservaModal.espacio && (
        <div className="servicios-modal-overlay">
          <div className="servicios-modal">
            <div className="servicios-modal-header servicios-modal-header-success">
              <div>
                <h3 className="servicios-modal-title">Reservar {reservaModal.espacio.nombre}</h3>
                <p className="servicios-modal-subtitle">
                  {reservaModal.espacio.tipo} - {reservaModal.espacio.facultad}
                </p>
              </div>
              <button
                onClick={reservaModal.onClose}
                className="servicios-modal-close"
                disabled={reservaModal.loading}
              >
                <X className="servicios-modal-close-icon" />
              </button>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                reservaModal.onSubmit();
              }}
              className="servicios-modal-form"
            >
              <div className="servicios-modal-info">
                <p className="servicios-modal-info-text">
                  <strong>Información del espacio:</strong> {reservaModal.espacio.ubicacion} | Capacidad:{' '}
                  {reservaModal.espacio.capacidad}
                </p>
              </div>

              {reservaModal.success && (
                <div className="servicios-modal-success">{reservaModal.success}</div>
              )}
              {reservaModal.error && <div className="servicios-modal-error">{reservaModal.error}</div>}
              {reservaModal.bloquesError && (
                <div className="servicios-modal-error">{reservaModal.bloquesError}</div>
              )}

              <div className="servicios-form-grid">
                <div className="servicios-form-group">
                  <label className="servicios-form-label">Ciclo *</label>
                  <select
                    value={reservaModal.form.ciclo}
                    onChange={(event) => handleReservaModalChange('ciclo', event.target.value)}
                    className="servicios-form-input"
                    required
                    disabled={reservaModal.loading || Boolean(reservaModal.success)}
                  >
                    <option value="">Selecciona ciclo</option>
                    {['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="servicios-form-group">
                  <label className="servicios-form-label">Curso / Tema *</label>
                  <input
                    type="text"
                    value={reservaModal.form.curso}
                    onChange={(event) => handleReservaModalChange('curso', event.target.value)}
                    placeholder="Ej: Programación Web"
                    className="servicios-form-input"
                    required
                    disabled={reservaModal.loading || Boolean(reservaModal.success)}
                  />
                </div>
              </div>

              <div className="servicios-form-group">
                <label className="servicios-form-label">Fecha *</label>
                <input
                  type="date"
                  value={reservaModal.form.date}
                  onChange={(event) => handleReservaModalChange('date', event.target.value)}
                  min={hoy}
                  className="servicios-form-input"
                  required
                  disabled={reservaModal.loading}
                />
              </div>

              <div className="servicios-form-group">
                <label className="servicios-form-label">Bloque horario *</label>
                <select
                  value={reservaModal.form.bloqueId}
                  onChange={handleBloqueChange}
                  className="servicios-form-select"
                  required
                  disabled={
                    reservaModal.loading ||
                    Boolean(reservaModal.success) ||
                    reservaModal.bloquesCargando ||
                    Boolean(reservaModal.bloquesError) ||
                    reservaModal.bloques.length === 0
                  }
                >
                  <option value="">
                    {reservaModal.bloquesCargando
                      ? 'Cargando bloques horarios...'
                      : 'Selecciona un bloque disponible'}
                  </option>
                  {!reservaModal.bloquesCargando &&
                    reservaModal.bloques.map((bloque) => (
                      <option key={bloque.id} value={bloque.id}>
                        {bloque.label}
                      </option>
                    ))}
                </select>
                {!reservaModal.bloquesCargando &&
                  !reservaModal.bloquesError &&
                  reservaModal.bloques.length === 0 && (
                    <p className="servicios-form-help">
                      No se encontraron bloques horarios configurados para reservar.
                    </p>
                  )}
              </div>

              <div className="servicios-form-grid">
                <div className="servicios-form-group">
                  <label className="servicios-form-label">Hora Inicio *</label>
                  <input
                    type="text"
                    value={reservaModal.form.startTime}
                    placeholder="Selecciona un bloque horario"
                    className="servicios-form-input"
                    readOnly
                    disabled
                  />
                </div>
                <div className="servicios-form-group">
                  <label className="servicios-form-label">Hora Fin *</label>
                  <input
                    type="text"
                    value={reservaModal.form.endTime}
                    placeholder="Selecciona un bloque horario"
                    className="servicios-form-input"
                    readOnly
                    disabled
                  />
                </div>
              </div>

              <div className="servicios-form-group">
                <label className="servicios-form-label">Motivo o Descripción (Opcional)</label>
                <textarea
                  value={reservaModal.form.motivo}
                  onChange={(event) => handleReservaModalChange('motivo', event.target.value)}
                  placeholder="Describe el motivo de tu reserva..."
                  rows={3}
                  className="servicios-form-textarea"
                  disabled={reservaModal.loading || Boolean(reservaModal.success)}
                />
              </div>

              <div className="servicios-modal-note">
                <p className="servicios-modal-note-text">
                  <strong>Nota:</strong> Tu reserva quedará en estado "Pendiente" hasta que sea aprobada por el administrador.
                </p>
              </div>

              <div className="servicios-modal-actions">
                <button
                  type="submit"
                  className="servicios-modal-btn servicios-modal-btn-primary"
                  disabled={reservaModal.loading || Boolean(reservaModal.success)}
                >
                  <Check className="servicios-modal-btn-icon" />
                  {reservaModal.loading ? 'Enviando...' : 'Enviar Solicitud'}
                </button>
                <button
                  type="button"
                  onClick={reservaModal.onClose}
                  className="servicios-modal-btn servicios-modal-btn-secondary"
                  disabled={reservaModal.loading}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};