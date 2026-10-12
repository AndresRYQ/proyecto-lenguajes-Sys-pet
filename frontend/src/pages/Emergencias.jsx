import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { emergenciasApi, sedesApi, citasApi } from '../api'
import { Btn, Badge, PageHeader, EmptyState } from '../components/ui'

const PRIORIDAD_CONFIG = {
  alta:  { label: 'Prioridad Alta',  border: 'border-red-400',    bg: 'bg-red-50',    dot: 'bg-red-500',    text: 'text-red-700' },
  media: { label: 'Prioridad Media', border: 'border-amber-400',  bg: 'bg-amber-50',  dot: 'bg-amber-500',  text: 'text-amber-700' },
  baja:  { label: 'Prioridad Baja',  border: 'border-emerald-400',bg: 'bg-emerald-50',dot: 'bg-emerald-500', text: 'text-emerald-700' },
}

function CitaCard({ c, onEstado, onPrioridad }) {
  const cfg = PRIORIDAD_CONFIG[c.prioridad]
  return (
    <div className={`border-l-4 ${cfg.border} ${cfg.bg} rounded-r-xl p-4 flex items-start justify-between gap-4`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
          <span className="font-semibold text-slate-800">{c.mascota_nombre}</span>
          <span className="text-slate-500 text-sm">— {c.cliente_nombre}</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-500 ml-4">
          <span>{c.hora?.slice(0, 5)}</span>
          <span>{c.veterinario_nombre}</span>
          <span>{c.sede_nombre}</span>
        </div>
        {c.motivo && <p className="ml-4 mt-1 text-sm text-slate-600 italic">"{c.motivo}"</p>}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Badge value={c.estado} />
        {c.estado === 'pendiente'   && <Btn size="sm" onClick={() => onEstado(c.id, 'confirmada')}>Confirmar</Btn>}
        {c.estado === 'confirmada'  && <Btn size="sm" onClick={() => onEstado(c.id, 'en_atencion')}>Atender</Btn>}
        {c.estado === 'en_atencion' && <Btn size="sm" variant="ghost" onClick={() => onEstado(c.id, 'finalizada')}>Finalizar</Btn>}
        {c.prioridad !== 'alta' && (
          <Btn size="sm" variant="warning" onClick={() => onPrioridad(c.id, c.prioridad === 'media' ? 'alta' : 'media')}>
            ↑ Subir
          </Btn>
        )}
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
        <div className="flex items-center gap-2 mb-3">
          <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
          <h3 className={`font-semibold text-sm uppercase tracking-wider ${cfg.text}`}>{cfg.label} ({items.length})</h3>
        </div>
        <div className="space-y-3">
          {items.map(c => <CitaCard key={c.id} c={c} onEstado={onEstado} onPrioridad={onPrioridad} />)}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <PageHeader title="Cola de Emergencias" subtitle={`${cola.length} citas activas`}>
        <Btn variant="ghost" onClick={cargar}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          Actualizar
        </Btn>
      </PageHeader>

      <div className="p-8">
        <div className="flex flex-wrap gap-3 mb-8">
          <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} className="px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white" />
          {user?.rol === 'admin' && (
            <select value={sedeId} onChange={e => setSedeId(e.target.value)} className="px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
              <option value="">Todas las sedes</option>
              {sedes.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
            </select>
          )}
        </div>

        {loading ? (
          <div className="text-center py-16 text-slate-400 text-sm">Cargando...</div>
        ) : cola.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <svg className="w-10 h-10 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-slate-400 text-sm">No hay citas activas en la cola para esta fecha</p>
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
