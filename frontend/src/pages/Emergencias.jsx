import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { emergenciasApi, sedesApi, citasApi } from '../api'
import { Btn, Badge, PageHeader, Avatar, Spinner, cn } from '../components/ui'

const PRIORIDAD_CONFIG = {
  alta:  { label: 'Prioridad Alta',  border: 'border-red-400',    bg: 'bg-red-50/70',    dot: 'bg-red-500',    text: 'text-red-700',    soft: 'bg-red-100' },
  media: { label: 'Prioridad Media', border: 'border-amber-400',  bg: 'bg-amber-50/70',  dot: 'bg-amber-500',  text: 'text-amber-700',  soft: 'bg-amber-100' },
  baja:  { label: 'Prioridad Baja',  border: 'border-emerald-400',bg: 'bg-emerald-50/70',dot: 'bg-emerald-500',text: 'text-emerald-700',soft: 'bg-emerald-100' },
}

function CitaCard({ c, onEstado, onPrioridad }) {
  const cfg = PRIORIDAD_CONFIG[c.prioridad]
  return (
    <div className={cn('border border-slate-100 border-l-4 rounded-2xl p-4 flex items-start justify-between gap-4 shadow-sm hover:shadow-md transition-all', cfg.border, cfg.bg)}>
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <Avatar name={c.mascota_nombre} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-slate-800">{c.mascota_nombre}</span>
            <span className="text-slate-500 text-sm truncate">— {c.cliente_nombre}</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {c.hora?.slice(0, 5)}
            </span>
            <span>{c.veterinario_nombre}</span>
            <span className="px-2 py-0.5 rounded-full bg-white/70 border border-slate-200 font-medium text-slate-600">{c.sede_nombre}</span>
          </div>
          {c.motivo && <p className="mt-2 text-sm text-slate-600 italic border-l-2 border-slate-300 pl-2">"{c.motivo}"</p>}
        </div>
      </div>
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <Badge value={c.estado} />
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {c.estado === 'pendiente'   && <Btn size="sm" onClick={() => onEstado(c.id, 'confirmada')}>Confirmar</Btn>}
          {c.estado === 'confirmada'  && <Btn size="sm" onClick={() => onEstado(c.id, 'en_atencion')}>Atender</Btn>}
          {c.estado === 'en_atencion' && <Btn size="sm" variant="ghost" onClick={() => onEstado(c.id, 'finalizada')}>Finalizar</Btn>}
          {c.prioridad !== 'alta' && (
            <Btn size="sm" variant="warning" onClick={() => onPrioridad(c.id, c.prioridad === 'media' ? 'alta' : 'media')}>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
              Subir
            </Btn>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Emergencias() {
  const { user } = useAuth()
  const [cola, setCola] = useState([])
  const [sedes, setSedes] = useState([])
  const [sedeId, setSedeId] = useState(user?.sede_id ? String(user.sede_id) : '')
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(true)

  async function cargar() {
    setLoading(true)
    try {
      const params = {}
      if (sedeId) params.sede_id = sedeId
      if (fecha) params.fecha = fecha
      setCola(await emergenciasApi.cola(params))
    } finally { setLoading(false) }
  }

  useEffect(() => { sedesApi.listar().then(setSedes); cargar() }, [])
  useEffect(() => { cargar() }, [sedeId, fecha])

  async function onEstado(id, estado) { await citasApi.cambiarEstado(id, estado); cargar() }
  async function onPrioridad(id, prioridad) { await citasApi.actualizar(id, { prioridad }); cargar() }

  const altas  = cola.filter(c => c.prioridad === 'alta')
  const medias = cola.filter(c => c.prioridad === 'media')
  const bajas  = cola.filter(c => c.prioridad === 'baja')

  function Grupo({ items, prioridad }) {
    if (items.length === 0) return null
    const cfg = PRIORIDAD_CONFIG[prioridad]
    return (
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-3">
          <span className={cn('w-2.5 h-2.5 rounded-full', cfg.dot, prioridad === 'alta' && 'animate-pulse-soft')} />
          <h3 className={cn('font-semibold text-xs uppercase tracking-wider', cfg.text)}>{cfg.label}</h3>
          <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', cfg.soft, cfg.text)}>{items.length}</span>
        </div>
        <div className="space-y-3">
          {items.map(c => <CitaCard key={c.id} c={c} onEstado={onEstado} onPrioridad={onPrioridad} />)}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <PageHeader
        title="Cola de Emergencias"
        subtitle={`${cola.length} ${cola.length === 1 ? 'cita activa' : 'citas activas'}`}
        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
      >
        <Btn variant="ghost" onClick={cargar} disabled={loading}>
          <span className={loading ? 'animate-spin' : ''}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </span>
          Actualizar
        </Btn>
      </PageHeader>

      <div className="p-6 lg:p-8 animate-fade-up">
        <div className="flex flex-wrap gap-3 mb-8">
          <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} className="px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400 bg-white" />
          {user?.rol === 'admin' && (
            <select value={sedeId} onChange={e => setSedeId(e.target.value)} className="px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400 bg-white">
              <option value="">Todas las sedes</option>
              {sedes.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
            </select>
          )}
        </div>

        {loading ? (
          <div className="text-center py-16 flex flex-col items-center gap-3 text-slate-400 text-sm"><Spinner className="w-6 h-6" />Cargando cola...</div>
        ) : cola.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <p className="text-slate-500 text-sm">No hay citas activas en la cola para esta fecha</p>
            </div>
          </div>
        ) : (
          <>
            <Grupo items={altas}  prioridad="alta" />
            <Grupo items={medias} prioridad="media" />
            <Grupo items={bajas}  prioridad="baja" />
          </>
        )}
      </div>
    </div>
  )
}
