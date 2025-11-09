import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Navigation } from './Navigation';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Plus,
  Trash2,
  X,
  Eye,
  Server,
  Monitor,
  MessageCircle,
  ClipboardList,
  AlertCircle
} from 'lucide-react';
import './../../styles/ServiciosScreen.css';
import { ServiciosMenu } from './ServiciosMenu';
import { EspaciosGrid } from './EspaciosGrid';
import { HorarioSemanal } from './HorarioSemanal';
import {
  ReservaForm,
  type EspaciosFormState,
  type ReservaRapidaFormState,
  type BloqueHorarioOption
} from './ReservaForm';
import { espaciosService } from './services/espaciosService';
import { reservasService } from './services/reservasService';
import { serviciosScreenService, type HorarioCompleto } from './services/serviciosScreenService';
import { horariosService, type BloqueHorarioCatalogoMap } from './services/horariosService';

import type { Espacio, Reservacion } from './types';

interface BackendSession {
  perfil?: {
    escuela?: string | null;
  } | null;
}

interface ServiciosScreenProps {
  user: {
    id: string;
    email: string;
    user_metadata: {
      name: string;
      avatar_url: string;
      role?: string;
      login_type?: string;
      codigo?: string;
    };
  };
  currentSection?: 'home' | 'servicios' | 'eventos' | 'perfil';
  onSectionChange?: (section: 'home' | 'servicios' | 'eventos' | 'perfil') => void;
  onBackToDashboard?: () => void;
}
type EstadoReservasFiltro = 'pending' | 'approved' | 'rejected';

export const ServiciosScreen: React.FC<ServiciosScreenProps> = ({
  user,
  currentSection = 'servicios',
  onSectionChange,
  onBackToDashboard
}) => {
  const [selectedService, setSelectedService] = useState<'menu' | 'espacios' | 'citas'>('menu');
  const [view, setView] = useState<'list' | 'new' | 'edit' | 'espacios-grid' | 'horario-semanal' | 'reservar-espacio'>('list');
  const [selectedEspacio, setSelectedEspacio] = useState<Espacio | null>(null);
  const [showReservaModal, setShowReservaModal] = useState(false);
  const [espacioToReserve, setEspacioToReserve] = useState<Espacio | null>(null);
  const [reservaModalError, setReservaModalError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para datos reales
  const [espacios, setEspacios] = useState<Espacio[]>([]);
  const [reservacionesEspacios, setReservacionesEspacios] = useState<Reservacion[]>([]);
  const [horariosEspacios, setHorariosEspacios] = useState<Record<string, HorarioCompleto[]>>({});
  const [horariosCargando, setHorariosCargando] = useState(false);

  const [bloquesCatalogo, setBloquesCatalogo] = useState<BloqueHorarioCatalogoMap>(horariosService.getBloquesHorarios());
  const [bloquesCargando, setBloquesCargando] = useState(true);
  const [bloquesError, setBloquesError] = useState<string | null>(null);
  const [formSuccessMessage, setFormSuccessMessage] = useState<string | null>(null);
  const [reservaModalSuccess, setReservaModalSuccess] = useState<string | null>(null);
  const [mostrarEstadoReservas, setMostrarEstadoReservas] = useState(false);
  const [estadoReservasFiltro, setEstadoReservasFiltro] = useState<EstadoReservasFiltro>('pending');
  const [estadoReservasBusqueda, setEstadoReservasBusqueda] = useState('');
  const [reservaMotivoVisibleId, setReservaMotivoVisibleId] = useState<string | null>(null);
  const [escuelaId, setEscuelaId] = useState<number | null | undefined>(undefined);

    const loginType = user.user_metadata.login_type;

    const estadoReservasInfo: Record<EstadoReservasFiltro, { label: string; descripcion: string }> = {
      pending: {
        label: 'Pendientes',
        descripcion: 'Solicitudes en revisión por el administrador'
      },
      approved: {
        label: 'Aprobadas',
        descripcion: 'Solicitudes aprobadas y listas para usarse'
      },
      rejected: {
        label: 'Rechazadas',
        descripcion: 'Solicitudes rechazadas por el administrador'
      }
    };

   useEffect(() => {
     let activo = true;

     const cargarBloques = async () => {
       try {
         const bloques = await horariosService.fetchBloquesHorarios();
         if (activo) {
           setBloquesCatalogo({ ...bloques });
           setBloquesError(null);
         }
       } catch (error) {
         console.error('Error al cargar bloques horarios:', error);
         if (activo) {
           setBloquesError('No se pudieron cargar los bloques horarios desde la base de datos.');
         }
       } finally {
         if (activo) {
           setBloquesCargando(false);
         }
       }
     };

     cargarBloques();

     return () => {
       activo = false;
     };
   }, []);

   const ordenBloques = useMemo(() => {
     const mapaOrden = new Map<number, number>();
     Object.entries(bloquesCatalogo)
       .sort(([, a], [, b]) => (a.orden ?? Number.MAX_SAFE_INTEGER) - (b.orden ?? Number.MAX_SAFE_INTEGER))
       .forEach(([id], index) => {
        mapaOrden.set(Number(id), index);
      });
         return mapaOrden;
        }, [bloquesCatalogo]);

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

    const obtenerOrdenBloque = (bloqueId: number) => {
      const bloqueCatalogo = bloquesCatalogo[bloqueId];
     if (bloqueCatalogo?.orden != null) {
            return bloqueCatalogo.orden;
      }
      const ordenCatalogo = ordenBloques.get(bloqueId);
      return ordenCatalogo !== undefined ? ordenCatalogo + 1 : bloqueId;
    };

  const bloquesOrdenados = useMemo<BloqueHorarioOption[]>(() => {
    return Object.entries(bloquesCatalogo)
      .map(([id, bloque]) => {
        const horaInicio = formatearHora(bloque?.horaInicio);
        const horaFinal = formatearHora(bloque?.horaFinal);
        const orden = bloque?.orden ?? ordenBloques.get(Number(id)) ?? Number(id);

        return {
          id: Number(id),
          label: `${bloque?.nombre ?? `Bloque ${id}`} (${horaInicio} - ${horaFinal})`,
          horaInicio,
          horaFinal,
          orden: typeof orden === 'number' ? orden : Number(id)
        };
      })
      .sort((a, b) => {
        if (a.orden !== b.orden) {
          return a.orden - b.orden;
        }
        return a.id - b.id;
      });
  }, [bloquesCatalogo, ordenBloques]);

 const reservasFiltradasPorEstado = useMemo(() => {
     const terminoBusqueda = estadoReservasBusqueda.trim().toLowerCase();

     const normalizarTexto = (texto: string) =>
       texto
         .normalize('NFD')
         .replace(/[\u0300-\u036f]/g, '')
         .toLowerCase();

     const terminoNormalizado = normalizarTexto(terminoBusqueda);

     const coincideBusqueda = (nombre: string) => {
       if (!terminoNormalizado) {
         return true;
       }

       return normalizarTexto(nombre).includes(terminoNormalizado);
     };

     const obtenerMarcaTiempo = (reserva: Reservacion) => {
       if (!reserva.date) {
         return 0;
       }

       const fecha = new Date(reserva.date);

       if (Number.isNaN(fecha.getTime())) {
         return 0;
       }

       if (reserva.startTime) {
         const [horas, minutos] = reserva.startTime.split(':').map(Number);

         if (!Number.isNaN(horas) && !Number.isNaN(minutos)) {
           fecha.setHours(horas, minutos, 0, 0);
         }
       }

       return fecha.getTime();
     };

     return reservacionesEspacios
       .filter(reserva => reserva.status === estadoReservasFiltro)
       .filter(reserva => coincideBusqueda(reserva.resource))
       .slice()
       .sort((a, b) => obtenerMarcaTiempo(b) - obtenerMarcaTiempo(a));
   }, [estadoReservasFiltro, estadoReservasBusqueda, reservacionesEspacios]);



  // Estado para formulario de reserva de espacios
  const [espaciosForm, setEspaciosForm] = useState<EspaciosFormState>({
    type: 'laboratorio',
    resource: '',
    date: '',
    bloqueId: '',
    startTime: '',
    endTime: '',
    ciclo: '',
    curso: ''
  });

  // Estado para formulario de reserva rápida desde card
  const [reservaRapidaForm, setReservaRapidaForm] = useState<ReservaRapidaFormState>({
    ciclo: '',
    curso: '',
    date: '',
    bloqueId: '',
    startTime: '',
    endTime: '',
    motivo: ''
  });

  // Estado para formulario de citas psicológicas
  const [citasForm, setCitasForm] = useState({
    date: '',
    startTime: '',
    motivo: ''
  });

  // Citas de psicología (mantenemos datos mock por ahora)
  const [citasPsicologia, setCitasPsicologia] = useState<Reservacion[]>([
    {
      id: '3',
      type: 'psicologia',
      resource: 'Orientación Psicológica',
      date: '2025-10-12',
      startTime: '15:00',
      endTime: '15:40',
      status: 'active',
      motivo: 'Orientación académica'
    }
  ]);

  // Cargar datos reales al montar el componente
  const cargarEspacios = useCallback(async (escuelaIdFiltro?: number | null) => {
      try {
        setLoading(true);
        setError(null);
        const filtros = escuelaIdFiltro != null ? { escuelaId: escuelaIdFiltro } : undefined;
        const espaciosBD = await espaciosService.getAllEspacios(filtros);

        const espaciosFiltrados = escuelaIdFiltro != null
          ? espaciosBD.filter(espacioBD => {
              const espacioEscuelaId = espaciosService.getEscuelaIdByName(espacioBD.escuela);
              return espacioEscuelaId === escuelaIdFiltro;
            })
          : espaciosBD;

        const espaciosMapeados: Espacio[] = espaciosFiltrados.map(espacioBD => ({
          id: espacioBD.id.toString(),
          codigo: espacioBD.codigo,
          nombre: espacioBD.nombre,
          ubicacion: espacioBD.ubicacion || 'Ubicación no especificada',
          tipo: espaciosService.getTipoFrontend(espacioBD.tipo),
          capacidad: espacioBD.capacidad,
          equipamiento: espacioBD.equipamiento || 'Equipamiento no especificado',
          facultad: espacioBD.facultad,
          escuela: espacioBD.escuela,
          estado: espaciosService.getEstadoTexto(espacioBD.estado)
        }));

        setEspacios(espaciosMapeados);
      } catch (err) {
        setError('Error al cargar los espacios');
        console.error('Error cargando espacios:', err);
      } finally {
        setLoading(false);
      }
  }, []);

 const cargarReservaciones = useCallback(async () => {
    try {
      const reservasBD = await reservasService.getReservasPorEstado();

      // Mapear reservas de BD a formato del frontend
      const reservasMapeadas = reservasBD.map(reservaBD =>
        reservasService.mapearReservaFrontend(reservaBD)
      );

      setReservacionesEspacios(reservasMapeadas);
    } catch (err) {
      console.error('Error cargando reservaciones:', err);
    }
  }, []);

    useEffect(() => {
      if (loginType !== 'academic') {
        setEscuelaId(null);
        return;
      }

      if (typeof window === 'undefined') {
        setEscuelaId(null);
        return;
      }

      try {
        const sessionRaw = localStorage.getItem('backend_session');
        if (!sessionRaw) {
          setEscuelaId(null);
          return;
        }

        const session = JSON.parse(sessionRaw) as BackendSession;
        const escuelaNombre = session?.perfil?.escuela ?? null;
        if (!escuelaNombre) {
          setEscuelaId(null);
          return;
        }

        const resolvedId = espaciosService.getEscuelaIdByName(escuelaNombre);
        setEscuelaId(resolvedId ?? null);
      } catch (storageError) {
        console.error('Error al obtener la escuela del usuario desde la sesión', storageError);
        setEscuelaId(null);
      }
    }, [loginType]);

    useEffect(() => {
      if (escuelaId === undefined) {
        return;
      }

      cargarEspacios(escuelaId);
    }, [cargarEspacios, escuelaId]);

    useEffect(() => {
      cargarReservaciones();
    }, [cargarReservaciones]);

  const handleCreateEspacio = async () => {
    try {
      setLoading(true);
      setFormSuccessMessage(null);

      // Crear la descripción con ciclo y curso
      const descripcion = `Ciclo: ${espaciosForm.ciclo} - Curso: ${espaciosForm.curso}`;

      // Buscar el espacio seleccionado para obtener su ID
      const espacioSeleccionado = espacios.find(e => e.nombre === espaciosForm.resource);

      if (!espacioSeleccionado) {
        throw new Error('Espacio no encontrado');
      }

      // Preparar datos para la API
      const reservaData = {
        usuario: parseInt(user.id),
        espacio: parseInt(espacioSeleccionado.id),
        fechaReserva: espaciosForm.date,
        bloque: 10, // Por defecto, necesitarías mapear el horario
        descripcion: descripcion
      };

      // Enviar a la API
      await reservasService.crearReserva(reservaData);

      // Recargar reservaciones
      await cargarReservaciones();

      setEspaciosForm({ type: 'laboratorio', resource: '', date: '', bloqueId: '', startTime: '', endTime: '', ciclo: '', curso: '' });
      setFormSuccessMessage('¡Reserva enviada! Tu solicitud está pendiente de aprobación por el administrador.');

    } catch (err) {
      setError('Error al crear la reserva');
      console.error('Error creando reserva:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReservarEspacio = (espacio: Espacio) => {
    setEspacioToReserve(espacio);
    setReservaModalError(null);
    setReservaModalSuccess(null);
    setReservaRapidaForm({
      ciclo: '',
      curso: '',
      date: '',
      bloqueId: '',
      startTime: '',
      endTime: '',
      motivo: ''
    });
    setShowReservaModal(true);
  };

const closeReservaModal = () => {
    setShowReservaModal(false);
    setReservaModalError(null);
    setReservaModalSuccess(null);
    setEspacioToReserve(null);
    setReservaRapidaForm({
      ciclo: '',
      curso: '',
      date: '',
      bloqueId: '',
      startTime: '',
      endTime: '',
      motivo: ''
    });
  };


  const handleSubmitReservaRapida = async () => {
    if (!espacioToReserve) return;

    try {
      setLoading(true);
      setReservaModalError(null);
      setReservaModalSuccess(null);


            if (!reservaRapidaForm.bloqueId) {
              setReservaModalError('Selecciona un bloque horario disponible antes de enviar tu solicitud.');
              return;
            }

            const bloqueId = parseInt(reservaRapidaForm.bloqueId, 10);

            if (Number.isNaN(bloqueId)) {
              setReservaModalError('El bloque horario seleccionado no es válido.');
              return;
            }

            const bloqueSeleccionado = bloquesCatalogo[bloqueId];

            if (!bloqueSeleccionado) {
              setReservaModalError('No se pudo identificar el bloque horario seleccionado. Intenta nuevamente.');
              return;
            }

            if (!reservaRapidaForm.date) {
              setReservaModalError('Selecciona la fecha de tu reserva.');
              return;
            }

      // Crear la descripción con ciclo y curso
     const horaInicio = formatearHora(bloqueSeleccionado.horaInicio);
           const horaFin = formatearHora(bloqueSeleccionado.horaFinal);
           const descripcion = `Ciclo: ${reservaRapidaForm.ciclo} - Curso: ${reservaRapidaForm.curso} - Horario: ${horaInicio} a ${horaFin} - ${reservaRapidaForm.motivo || 'Sin descripción adicional'}`;

           const motivo = reservaRapidaForm.motivo?.trim();

      // Preparar datos para la API
      const reservaData = {
        usuario: parseInt(user.id),
        espacio: parseInt(espacioToReserve.id),
        fechaReserva: reservaRapidaForm.date,
        bloque: bloqueId,
        descripcion: descripcion,
        motivo: motivo ? motivo : undefined
      };

      // Enviar a la API
      await reservasService.crearReserva(reservaData);

      // Recargar reservaciones
      await cargarReservaciones();

     setReservaModalError(null);
           setReservaModalSuccess('¡Reserva enviada! Tu solicitud está pendiente de aprobación por el administrador.');
           setReservaRapidaForm({
             ciclo: '',
             curso: '',
             date: '',
             bloqueId: '',
             startTime: '',
             endTime: '',
             motivo: ''
           });

    } catch (err) {
      setError('Error al crear la reserva');
      console.error('Error creando reserva:', err);
       setReservaModalError('No se pudo crear la reserva. Intenta nuevamente en unos momentos.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCita = () => {
    // Calcular hora de fin (40 minutos después)
    const [hours, minutes] = citasForm.startTime.split(':').map(Number);
    const endMinutes = minutes + 40;
    const endHours = hours + Math.floor(endMinutes / 60);
    const endTime = `${endHours.toString().padStart(2, '0')}:${(endMinutes % 60).toString().padStart(2, '0')}`;

    const newCita: Reservacion = {
      id: Date.now().toString(),
      type: 'psicologia',
      resource: 'Orientación Psicológica',
      date: citasForm.date,
      startTime: citasForm.startTime,
      endTime: endTime,
      status: 'pending',
      motivo: citasForm.motivo
    };

    setCitasPsicologia([...citasPsicologia, newCita]);
    setCitasForm({ date: '', startTime: '', motivo: '' });
    setView('list');
    setSelectedService('menu');
  };

  const handleCancelReservacion = (id: string, type: 'espacios' | 'citas') => {
    if (window.confirm('¿Estás seguro de cancelar esta reserva?')) {
      if (type === 'espacios') {
        setReservacionesEspacios(reservacionesEspacios.map(r =>
          r.id === id ? { ...r, status: 'cancelled' as const } : r
        ));
      } else {
        setCitasPsicologia(citasPsicologia.map(r =>
          r.id === id ? { ...r, status: 'cancelled' as const } : r
        ));
      }
    }
  };

  const handleDeleteReservacion = (id: string, type: 'espacios' | 'citas') => {
    if (window.confirm('¿Estás seguro de eliminar esta reserva?')) {
      if (type === 'espacios') {
        setReservacionesEspacios(reservacionesEspacios.filter(r => r.id !== id));
      } else {
        setCitasPsicologia(citasPsicologia.filter(r => r.id !== id));
      }
    }
  };

  const handleVerHorario = async (espacio: Espacio) => {
    try {
      setHorariosCargando(true);
      setSelectedEspacio(espacio);

      console.log('Cargando horarios para espacio:', espacio);

      // Usar el NUEVO servicio especializado
      const horariosCompletos = await serviciosScreenService.getHorariosCompletosPorEspacio(parseInt(espacio.id));

      console.log('Horarios completos recibidos:', horariosCompletos);


      console.log('Horarios finales para tabla:', horariosCompletos);
      setHorariosEspacios({ [espacio.id]: horariosCompletos });
      setView('horario-semanal');

    } catch (error) {
      console.error('Error cargando horarios:', error);
      setHorariosEspacios({});
      setView('horario-semanal');
    } finally {
      setHorariosCargando(false);
    }
  };




  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'servicios-status-active';
      case 'pending': return 'servicios-status-pending';
      case 'cancelled': return 'servicios-status-cancelled';
      case 'approved': return 'servicios-status-approved';
       case 'rejected': return 'servicios-status-rejected';
      default: return 'servicios-status-default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Activa';
      case 'pending': return 'Pendiente';
      case 'cancelled': return 'Cancelada';
      case 'approved': return 'Aprobada';
      case 'rejected': return 'Rechazada';
      default: return status;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'laboratorio': return <Server className="servicios-type-icon" />;
      case 'aula': return <Monitor className="servicios-type-icon" />;
      case 'psicologia': return <MessageCircle className="servicios-type-icon" />;
      default: return <MapPin className="servicios-type-icon" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'laboratorio': return 'Laboratorio';
      case 'aula': return 'Aula';
      case 'psicologia': return 'Psicología';
      default: return type;
    }
  };

  return (
    <div className="servicios-container">
      <Navigation
        user={user}
        currentSection={currentSection}
        onSectionChange={onSectionChange}
        onBackToDashboard={onBackToDashboard}
      />

      <main className="servicios-main">
        {/* Mostrar estado de carga o error */}
        {loading && (
          <div className="servicios-loading">
            Cargando...
          </div>
        )}

        {error && (
          <div className="servicios-error">
            {error}
            <button onClick={() => cargarEspacios(escuelaId ?? null)} className="servicios-retry-btn">
              Reintentar
            </button>
          </div>
        )}

        {/* Menú Principal de Servicios */}
        {selectedService === 'menu' && !loading && !error && (
          <ServiciosMenu
            onSelectEspacios={() => {
              setSelectedService('espacios');
              setView('espacios-grid');
            }}
            onSelectCitas={() => {
              setSelectedService('citas');
              setView('list');
            }}
          />
        )}

        {/* Vista de Grid de Espacios (para usuarios académicos) */}
        {selectedService === 'espacios' && view === 'espacios-grid' && !loading && !error && (
          <EspaciosGrid
            espacios={espacios}
            onBack={() => {
              setSelectedService('menu');
              setView('list');
              setFormSuccessMessage(null);
            }}
            onVerHorario={handleVerHorario}
            onReservar={handleReservarEspacio}
            onShowReservas={() => {
              setEstadoReservasFiltro('pending');
              setReservaMotivoVisibleId(null);
              setMostrarEstadoReservas(true);
            }}
          />
        )}

        {/* Vista Semanal de Horarios por Espacio */}
        {selectedService === 'espacios' && view === 'horario-semanal' && selectedEspacio && (
          <HorarioSemanal
            espacio={selectedEspacio}
            horarios={horariosEspacios[selectedEspacio.id] || []}
            bloquesCatalogo={bloquesCatalogo}
            ordenBloques={ordenBloques}
            bloquesError={bloquesError}
            horariosCargando={horariosCargando}
            onBack={() => setView('espacios-grid')}
          />
        )}

        {/* Vista de Reserva de Espacios (formulario) */}
        {selectedService === 'espacios' && view === 'list' && (
          <div>
            <button
               onClick={() => {
                              setSelectedService('menu');
                              setView('list');
                              setFormSuccessMessage(null);
                            }}
              className="servicios-back-btn"
            >
              <ArrowLeft className="servicios-back-icon" />
              Volver a Servicios
            </button>

            <div className="servicios-header">
              <h1 className="servicios-title">Reserva de Espacios</h1>
              <p className="servicios-subtitle">Reserva de laboratorios y aulas para tus actividades académicas</p>
            </div>

            <div className="servicios-actions">
              <button
                onClick={() => {
                                  setView('espacios-grid');
                                  setFormSuccessMessage(null);
                                }}
                className="servicios-action-btn servicios-action-btn-primary"
              >
                <Eye className="servicios-action-btn-icon" />
                Ver Horarios de Espacios
              </button>
              <button
                  onClick={() => {
                                  setView('new');
                                  setFormSuccessMessage(null);
                                }}
                className="servicios-action-btn servicios-action-btn-success"
              >
                <Plus className="servicios-action-btn-icon" />
                Nueva Reserva de Espacio
              </button>
              <button
                              onClick={() => {
                                                setEstadoReservasFiltro('pending');
                                                setReservaMotivoVisibleId(null);
                                                setMostrarEstadoReservas(true);
                                              }}
                              className="servicios-action-btn servicios-action-btn-info"
                            >
                              <ClipboardList className="servicios-action-btn-icon" />
                              Estado de mis Reservas
                            </button>
            </div>

            {reservacionesEspacios.length === 0 ? (
              <div className="servicios-empty">
                <Server className="servicios-empty-icon" />
                <h3 className="servicios-empty-title">No hay reservas de espacios</h3>
                <p className="servicios-empty-description">Comienza reservando un laboratorio o aula</p>
                <button
                  onClick={() => setView('new')}
                  className="servicios-empty-btn"
                >
                  Crear Reserva
                </button>
              </div>
            ) : (
              <div className="servicios-reservas-grid">
                {reservacionesEspacios.map((reservacion) => (
                  <div
                    key={reservacion.id}
                    className={`servicios-reserva-card ${
                      reservacion.status === 'active' ? 'servicios-reserva-active' :
                      reservacion.status === 'pending' ? 'servicios-reserva-pending' :
                      reservacion.status === 'approved' ? 'servicios-reserva-approved' :
                      reservacion.status === 'rejected' ? 'servicios-reserva-rejected' : 'servicios-reserva-cancelled'
                    }`}
                  >
                    <div className="servicios-reserva-header">
                      <div className="servicios-reserva-type">
                        {getTypeIcon(reservacion.type)}
                        <h3 className="servicios-reserva-type-label">{getTypeLabel(reservacion.type)}</h3>
                      </div>
                      <span className={`servicios-reserva-status ${getStatusColor(reservacion.status)}`}>
                        {getStatusLabel(reservacion.status)}
                      </span>
                    </div>

                    <div className="servicios-reserva-details">
                      <div className="servicios-reserva-detail">
                        <MapPin className="servicios-reserva-detail-icon" />
                        {reservacion.resource}
                      </div>
                      <div className="servicios-reserva-detail">
                        <Calendar className="servicios-reserva-detail-icon" />
                        {new Date(reservacion.date).toLocaleDateString('es-ES')}
                      </div>
                      <div className="servicios-reserva-detail">
                        <Clock className="servicios-reserva-detail-icon" />
                        {reservacion.startTime} - {reservacion.endTime}
                      </div>
                      {reservacion.ciclo && (
                        <div className="servicios-reserva-info servicios-reserva-info-ciclo">
                          <strong>Ciclo:</strong> {reservacion.ciclo}
                        </div>
                      )}
                      {reservacion.curso && (
                        <div className="servicios-reserva-info servicios-reserva-info-curso">
                          <strong>Curso:</strong> {reservacion.curso}
                        </div>
                      )}
                    </div>

                    {reservacion.status !== 'cancelled' && reservacion.status !== 'rejected' && (
                      <button
                        onClick={() => handleCancelReservacion(reservacion.id, 'espacios')}
                        className="servicios-reserva-action servicios-reserva-action-cancel"
                      >
                        <Trash2 className="servicios-reserva-action-icon" />
                        Cancelar
                      </button>
                    )}

                   {(reservacion.status === 'cancelled' || reservacion.status === 'rejected') && (
                      <button
                        onClick={() => handleDeleteReservacion(reservacion.id, 'espacios')}
                        className="servicios-reserva-action servicios-reserva-action-delete"
                      >
                        <Trash2 className="servicios-reserva-action-icon" />
                        Eliminar
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Formulario Nueva Reserva de Espacio y modal de reservas */}
        {selectedService === 'espacios' && (
          <ReservaForm
            espacios={espacios}
            espaciosForm={espaciosForm}
            onChangeEspaciosForm={(updates) =>
              setEspaciosForm((prev) => ({ ...prev, ...updates }))
            }
            onSubmitEspaciosForm={handleCreateEspacio}
            onCancel={() => {
              setView('list');
              setFormSuccessMessage(null);
            }}
            loading={loading}
            formSuccessMessage={formSuccessMessage}
            reservaModal={{
              visible: showReservaModal,
              espacio: espacioToReserve,
              form: reservaRapidaForm,
              onChange: (updates) =>
                setReservaRapidaForm((prev) => ({ ...prev, ...updates })),
              onSubmit: handleSubmitReservaRapida,
              onClose: closeReservaModal,
              loading,
              error: reservaModalError,
              success: reservaModalSuccess,
              bloques: bloquesOrdenados,
              bloquesCargando,
              bloquesError
            }}
            showForm={view === 'new'}
          />
        )}
    {mostrarEstadoReservas && (
              <div className="servicios-estado-modal-overlay" role="dialog" aria-modal="true">
                <div className="servicios-estado-modal">
                  <div className="servicios-estado-modal-header">
                    <div>
                      <h2 className="servicios-estado-modal-title">Estado de mis reservas</h2>
                      <p className="servicios-estado-modal-subtitle">
                        Consulta rápidamente cuáles de tus solicitudes están pendientes, aprobadas o han sido rechazadas.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="servicios-estado-modal-close"
                      onClick={() => {
                        setMostrarEstadoReservas(false);
                        setReservaMotivoVisibleId(null);
                         setEstadoReservasBusqueda('');
                      }}
                      aria-label="Cerrar"
                    >
                      <X className="servicios-estado-modal-close-icon" />
                    </button>
                  </div>
                   <div className="servicios-estado-search">
                                      <label className="servicios-estado-search-label" htmlFor="servicios-estado-search-input">
                                        Buscar laboratorio
                                      </label>
                                      <input
                                        id="servicios-estado-search-input"
                                        type="text"
                                        value={estadoReservasBusqueda}
                                        onChange={(event) => {
                                          setEstadoReservasBusqueda(event.target.value);
                                          setReservaMotivoVisibleId(null);
                                        }}
                                        placeholder="Escribe el nombre del laboratorio"
                                        className="servicios-estado-search-input"
                                      />
                                    </div>

                  <div className="servicios-estado-filters">
                    {(Object.keys(estadoReservasInfo) as EstadoReservasFiltro[]).map((estado) => (
                      <button
                        key={estado}
                        type="button"
                        className={`servicios-estado-filter-btn ${estadoReservasFiltro === estado ? 'is-active' : ''}`}
                        onClick={() => {
                          setEstadoReservasFiltro(estado);
                          setReservaMotivoVisibleId(null);
                        }}
                      >
                        <span className="servicios-estado-filter-label">{estadoReservasInfo[estado].label}</span>
                        <span className="servicios-estado-filter-description">{estadoReservasInfo[estado].descripcion}</span>
                      </button>
                    ))}
                  </div>

                  <div className="servicios-estado-list">
                    {reservasFiltradasPorEstado.length === 0 ? (
                      <div className="servicios-estado-empty">
                        <ClipboardList className="servicios-estado-empty-icon" />
                        <h3 className="servicios-estado-empty-title">Sin resultados en esta categoría</h3>
                        <p className="servicios-estado-empty-text">Cuando tengas reservas en este estado las verás aquí.</p>
                      </div>
                    ) : (
                      reservasFiltradasPorEstado.map((reserva) => {
                        const esRechazada = reserva.status === 'rejected';
                        const mostrarMotivo = esRechazada && reservaMotivoVisibleId === reserva.id;

                        return (
                          <div
                            key={reserva.id}
                            className={`servicios-estado-item servicios-estado-item-${reserva.status} ${
                              esRechazada ? 'servicios-estado-item-clickable' : ''
                            } ${mostrarMotivo ? 'is-open' : ''}`}
                            onClick={() => {
                              if (esRechazada) {
                                setReservaMotivoVisibleId((prev) => (prev === reserva.id ? null : reserva.id));
                              }
                            }}
                            onKeyDown={(event) => {
                              if (esRechazada && (event.key === 'Enter' || event.key === ' ')) {
                                event.preventDefault();
                                setReservaMotivoVisibleId((prev) => (prev === reserva.id ? null : reserva.id));
                              }
                            }}
                            role={esRechazada ? 'button' : undefined}
                            tabIndex={esRechazada ? 0 : undefined}
                          >
                            <div className="servicios-estado-item-main">
                              <div>
                                <h3 className="servicios-estado-item-title">{reserva.resource}</h3>
                                <p className="servicios-estado-item-info">
                                  {new Date(reserva.date).toLocaleDateString('es-ES')} · {reserva.startTime} - {reserva.endTime}
                                </p>
                                {reserva.curso && (
                                  <p className="servicios-estado-item-extra">Curso: {reserva.curso}</p>
                                )}
                              </div>
                              <span className={`servicios-estado-item-status ${getStatusColor(reserva.status)}`}>
                                {getStatusLabel(reserva.status)}
                              </span>
                            </div>

                            {esRechazada && (
                              <div className="servicios-estado-item-message">
                                {mostrarMotivo ? (
                                  <div className="servicios-estado-item-motivo">
                                    <AlertCircle className="servicios-estado-item-motivo-icon" />
                                    <div>
                                      <p className="servicios-estado-item-motivo-title">Motivo del rechazo</p>
                                      <p className="servicios-estado-item-motivo-text">
                                        {reserva.motivo?.trim() ? reserva.motivo : 'El administrador no proporcionó un motivo.'}
                                      </p>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="servicios-estado-item-hint">Haz clic para ver el motivo del rechazo</p>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}
      </main>
    </div>
  );
};