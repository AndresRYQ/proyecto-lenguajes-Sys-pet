import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { citasApi } from '../api'
import { Btn, Badge, PageHeader, Card, EmptyState, StatCard, Avatar, Spinner, TH, TD } from '../components/ui'

const ICONS = {
  citas: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  pendientes: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  atencion: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  canceladas: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  refresh: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
}

const ESTADO_META = {
  pendiente:   { label: 'Pendientes',   color: 'bg-amber-400' },
  confirmada:  { label: 'Confirmadas',  color: 'bg-emerald-400' },
  en_atencion: { label: 'En atención',  color: 'bg-blue-400' },
  finalizada:  { label: 'Finalizadas',  color: 'bg-slate-300' },
  cancelada:   { label: 'Canceladas',   color: 'bg-red-400' },
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [todas, setTodas] = useState([])
  const [loading, setLoading] = useState(true)
  const hoy = new Date().toISOString().split('T')[0]

  async function cargar() {
    setLoading(true)
    try { setTodas(await citasApi.listar({})) }
    catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { cargar() }, [])

  const citasHoy    = todas.filter(c => c.fecha === hoy)
  const total       = citasHoy.length
  const pendientes  = citasHoy.filter(c => c.estado === 'pendiente').length
  const enAtencion  = citasHoy.filter(c => c.estado === 'en_atencion').length
  const canceladas  = citasHoy.filter(c => c.estado === 'cancelada').length
  const citasActivas = todas
    .filter(c => !['cancelada', 'finalizada'].includes(c.estado))
    .sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora))

  const fecha = new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  const sedeLabel = user?.rol === 'admin' ? 'Ambas sedes' : `Sede ${user?.sede_id === 1 ? 'San Luis' : 'Surquillo'}`

  const distribucion = Object.entries(ESTADO_META)
    .map(([key, meta]) => ({ key, ...meta, count: citasHoy.filter(c => c.estado === key).length }))
    .filter(d => d.count > 0)

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <PageHeader
        title="Dashboard"
        subtitle={fecha.charAt(0).toUpperCase() + fecha.slice(1)}
        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>}
      >
        <span className="hidden sm:inline-flex items-center gap-1.5 text-xs bg-white/70 border border-slate-200 text-slate-600 font-medium px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse-soft" />
          {sedeLabel}
        </span>
        <Btn variant="ghost" onClick={cargar} disabled={loading}>
          <span className={loading ? 'animate-spin' : ''}>{ICONS.refresh}</span>
          Actualizar
        </Btn>
      </PageHeader>

      <div className="p-6 lg:p-8 space-y-6 animate-fade-up">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard label="Citas hoy" value={total} tone="brand" icon={ICONS.citas} loading={loading} hint="Agenda del día" />
          <StatCard label="Pendientes" value={pendientes} tone="amber" icon={ICONS.pendientes} loading={loading} hint="Por confirmar" />
          <StatCard label="En atención" value={enAtencion} tone="blue" icon={ICONS.atencion} loading={loading} hint="Consultorios activos" />
          <StatCard label="Canceladas" value={canceladas} tone="red" icon={ICONS.canceladas} loading={loading} hint="Del día de hoy" />
        </div>

        {distribucion.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-slate-800 text-sm">Distribución de citas de hoy</h3>
                <p className="text-xs text-slate-400 mt-0.5">{total} citas registradas</p>
              </div>
            </div>
            <div className="flex h-2.5 w-full rounded-full overflow-hidden bg-slate-100 mb-4">
              {distribucion.map(d => (
                <div key={d.key} className={`${d.color} transition-all`} style={{ width: `${(d.count / total) * 100}%` }} title={`${d.label}: ${d.count}`} />
              ))}
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {distribucion.map(d => (
                <div key={d.key} className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${d.color}`} />
                  <span className="text-xs text-slate-500">{d.label}</span>
                  <span className="text-xs font-semibold text-slate-700">{d.count}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card>
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">Citas activas</h3>
              <p className="text-xs text-slate-400 mt-0.5">Pendientes, confirmadas y en atención</p>
            </div>
            <button onClick={() => navigate('/citas')} className="text-xs text-brand-600 hover:text-brand-700 font-semibold inline-flex items-center gap-1">
              Gestionar
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>

          {loading ? (
            <div className="p-10 flex flex-col items-center gap-3 text-slate-400 text-sm">
              <Spinner className="w-6 h-6" />
              Cargando citas...
            </div>
          ) : citasActivas.length === 0 ? (
            <EmptyState msg="No hay citas pendientes ni en atención" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    {['Fecha', 'Hora', 'Paciente', 'Dueño', 'Veterinario', 'Motivo', 'Estado', 'Prioridad'].map(h => <TH key={h}>{h}</TH>)}
                  </tr>
                </thead>
                <tbody>
                  {citasActivas.map(c => (
                    <tr key={c.id} onClick={() => navigate('/citas')} className="hover:bg-slate-50/70 cursor-pointer transition-colors">
                      <TD className="text-xs text-slate-400 whitespace-nowrap">{c.fecha}</TD>
                      <TD className="font-semibold whitespace-nowrap">{c.hora?.slice(0, 5)}</TD>
                      <TD>
                        <div className="flex items-center gap-2.5">
                          <Avatar name={c.mascota_nombre} size="sm" />
                          <span className="font-semibold text-slate-800">{c.mascota_nombre}</span>
                        </div>
                      </TD>
                      <TD className="text-slate-500">{c.cliente_nombre}</TD>
                      <TD className="text-slate-600">{c.veterinario_nombre}</TD>
                      <TD className="text-slate-400 max-w-[200px] truncate">{c.motivo || '—'}</TD>
                      <TD><Badge value={c.estado} /></TD>
                      <TD><Badge value={c.prioridad} /></TD>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
