import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { citasApi } from '../api'
import { Btn, Badge, PageHeader, Card, EmptyState } from '../components/ui'

function StatCard({ label, value, color, iconBg, icon }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">{label}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
        <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
      </div>
    </Card>
  )
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
  const citasActivas = todas.filter(c => !['cancelada', 'finalizada'].includes(c.estado))

  const fecha = new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <PageHeader
        title="Dashboard"
        subtitle={fecha.charAt(0).toUpperCase() + fecha.slice(1)}
      >
        <span className="text-xs bg-slate-100 text-slate-600 font-medium px-3 py-1.5 rounded-full">
          {user?.rol === 'admin' ? 'Ambas sedes' : `Sede ${user?.sede_id === 1 ? 'San Luis' : 'Surquillo'}`}
        </span>
        <Btn variant="ghost" onClick={cargar}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          Actualizar
        </Btn>
      </PageHeader>

      <div className="p-8 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Citas hoy"
            value={loading ? '—' : total}
            color="text-slate-800"
            iconBg="bg-emerald-50"
            icon={<svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
          />
          <StatCard
            label="Pendientes"
            value={loading ? '—' : pendientes}
            color="text-slate-800"
            iconBg="bg-amber-50"
            icon={<svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <StatCard
            label="En atención"
            value={loading ? '—' : enAtencion}
            color="text-slate-800"
            iconBg="bg-blue-50"
            icon={<svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
          />
          <StatCard
            label="Canceladas"
            value={loading ? '—' : canceladas}
            color="text-slate-800"
            iconBg="bg-red-50"
            icon={<svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
        </div>

        <Card>
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">Citas activas</h3>
              <p className="text-xs text-slate-400 mt-0.5">Pendientes, confirmadas y en atención</p>
            </div>
            <button onClick={() => navigate('/citas')} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
              Gestionar →
            </button>
          </div>
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-sm">Cargando...</div>
          ) : citasActivas.length === 0 ? (
            <EmptyState msg="No hay citas pendientes ni en atención" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    {['Fecha', 'Hora', 'Paciente', 'Dueño', 'Veterinario', 'Motivo', 'Estado', 'Prioridad'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {citasActivas.map(c => (
                    <tr key={c.id} onClick={() => navigate('/citas')} className="hover:bg-slate-50 cursor-pointer transition-colors">
                      <td className="px-4 py-3 text-xs text-slate-400 border-t border-slate-100">{c.fecha}</td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-700 border-t border-slate-100">{c.hora?.slice(0, 5)}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-800 border-t border-slate-100">{c.mascota_nombre}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 border-t border-slate-100">{c.cliente_nombre}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 border-t border-slate-100">{c.veterinario_nombre}</td>
                      <td className="px-4 py-3 text-sm text-slate-400 border-t border-slate-100">{c.motivo || '—'}</td>
                      <td className="px-4 py-3 border-t border-slate-100"><Badge value={c.estado} /></td>
                      <td className="px-4 py-3 border-t border-slate-100"><Badge value={c.prioridad} /></td>
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
