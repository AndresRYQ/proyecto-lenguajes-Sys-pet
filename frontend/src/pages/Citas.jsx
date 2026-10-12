import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { citasApi, clientesApi, veterinariosApi, sedesApi } from '../api'
import { Btn, Badge, Modal, PageHeader, Card, ErrorMsg, EmptyState, Select, Input, TH, TD } from '../components/ui'

const ESTADOS = ['pendiente', 'confirmada', 'en_atencion', 'finalizada', 'cancelada']
const PRIORIDADES = ['baja', 'media', 'alta']

export default function Citas() {
  const { user } = useAuth()
  const [citas, setCitas] = useState([])
  const [sedes, setSedes] = useState([])
  const [vets, setVets] = useState([])
  const [clientes, setClientes] = useState([])
  const [mascotas, setMascotas] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtros, setFiltros] = useState({ fecha: '', sede_id: '', estado: '' })
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ fecha: '', hora: '', motivo: '', prioridad: 'media', mascota_id: '', veterinario_id: '', sede_id: '' })
  const [clienteId, setClienteId] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const setF = v => setFiltros(p => ({ ...p, ...v }))
  const setFrm = v => setForm(p => ({ ...p, ...v }))

  async function cargar() {
    setLoading(true)
    try {
      const params = Object.fromEntries(Object.entries(filtros).filter(([, v]) => v !== ''))
      setCitas(await citasApi.listar(params))
    } finally { setLoading(false) }
  }

  useEffect(() => {
    // Carga inicial: sedes, clientes y vets (si no es admin) en paralelo
    const init = async () => {
      const sedeDefault = user?.sede_id
      const calls = [sedesApi.listar(), clientesApi.listar()]
      if (sedeDefault) calls.push(veterinariosApi.listar(sedeDefault))
      const [sds, cls, vts] = await Promise.all(calls)
      setSedes(sds); setClientes(cls)
      if (vts) setVets(vts)
      cargar()
    }
    init()
  }, [])

  useEffect(() => { cargar() }, [filtros.fecha, filtros.sede_id, filtros.estado])

  async function abrirModal(cita = null) {
    setError('')
    if (cita) {
      // Editar: cargar vets de la sede + mascotas del cliente en paralelo
      const [vts, ms] = await Promise.all([
        veterinariosApi.listar(cita.sede_id),
        clientesApi.mascotas(cita.cliente_id),
      ])
      setVets(vts); setMascotas(ms)
      setForm({ fecha: cita.fecha, hora: cita.hora?.slice(0, 5), motivo: cita.motivo || '', prioridad: cita.prioridad, mascota_id: String(cita.mascota_id), veterinario_id: String(cita.veterinario_id), sede_id: String(cita.sede_id) })
      setModal(cita)
    } else {
      // Nueva: clientes y vets ya están cargados, abrir instantáneo
      if (!user?.sede_id) setVets([]) // admin: espera que elija sede
      setForm({ fecha: '', hora: '', motivo: '', prioridad: 'media', mascota_id: '', veterinario_id: '', sede_id: user?.sede_id ? String(user.sede_id) : '' })
      setClienteId(''); setMascotas([]); setModal('new')
    }
  }

  async function onClienteChange(e) {
    const id = e.target.value; setClienteId(id); setFrm({ mascota_id: '' })
    if (id) setMascotas(await clientesApi.mascotas(id))
    else setMascotas([])
  }

  async function onSedeChange(e) {
    const id = e.target.value; setFrm({ sede_id: id, veterinario_id: '' })
    if (id) setVets(await veterinariosApi.listar(parseInt(id)))
  }

  async function guardar(e) {
    e.preventDefault(); setSaving(true); setError('')
    try {
      const payload = { fecha: form.fecha, hora: form.hora, motivo: form.motivo || null, prioridad: form.prioridad, mascota_id: parseInt(form.mascota_id), veterinario_id: parseInt(form.veterinario_id), sede_id: parseInt(form.sede_id) }
      modal === 'new' ? await citasApi.crear(payload) : await citasApi.actualizar(modal.id, payload)
      setModal(null); cargar()
    } catch (err) { setError(err.message) } finally { setSaving(false) }
  }

  async function cambiarEstado(id, estado) {
    try { await citasApi.cambiarEstado(id, estado); cargar() }
    catch (err) { alert(err.message) }
  }

  const SIGUIENTE = { pendiente: ['confirmada'], confirmada: ['en_atencion'], en_atencion: ['finalizada'] }
  const LABEL = { confirmada: 'Confirmar', en_atencion: 'Atender', finalizada: 'Finalizar' }

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <PageHeader title="Citas" subtitle={`${citas.length} resultados`}>
        <Btn onClick={() => abrirModal()}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Nueva cita
        </Btn>
      </PageHeader>

      <div className="p-8">
        {/* Filtros */}
        <div className="flex flex-wrap gap-3 mb-6">
          <input type="date" value={filtros.fecha} onChange={e => setF({ fecha: e.target.value })} className="px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white" />
          {user?.rol === 'admin' && (
            <select value={filtros.sede_id} onChange={e => setF({ sede_id: e.target.value })} className="px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
              <option value="">Todas las sedes</option>
              {sedes.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
            </select>
          )}
          <select value={filtros.estado} onChange={e => setF({ estado: e.target.value })} className="px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
            <option value="">Todos los estados</option>
            {ESTADOS.map(e => <option key={e} value={e}>{e.replace('_', ' ')}</option>)}
          </select>
          {(filtros.fecha || filtros.sede_id || filtros.estado) && (
            <Btn variant="ghost" onClick={() => setFiltros({ fecha: '', sede_id: '', estado: '' })}>Limpiar</Btn>
          )}
        </div>

        <Card>
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-sm">Cargando...</div>
          ) : citas.length === 0 ? <EmptyState msg="No hay citas para los filtros seleccionados" /> : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr><TH>Fecha</TH><TH>Hora</TH><TH>Paciente</TH><TH>Dueño</TH><TH>Veterinario</TH><TH>Sede</TH><TH>Estado</TH><TH>Prior.</TH><TH>Acciones</TH></tr>
                </thead>
                <tbody>
                  {citas.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <TD className="font-medium">{c.fecha}</TD>
                      <TD className="font-semibold">{c.hora?.slice(0, 5)}</TD>
                      <TD><span className="font-semibold text-slate-800">{c.mascota_nombre}</span></TD>
                      <TD className="text-slate-500">{c.cliente_nombre}</TD>
                      <TD>{c.veterinario_nombre}</TD>
                      <TD>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.sede_nombre === 'San Luis' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                          {c.sede_nombre}
                        </span>
                      </TD>
                      <TD><Badge value={c.estado} /></TD>
                      <TD><Badge value={c.prioridad} /></TD>
                      <TD>
                        <div className="flex gap-1.5 flex-wrap">
                          <Btn size="sm" variant="ghost" onClick={() => abrirModal(c)}>Editar</Btn>
                          {SIGUIENTE[c.estado]?.map(sig => (
                            <Btn key={sig} size="sm" onClick={() => cambiarEstado(c.id, sig)}>{LABEL[sig]}</Btn>
                          ))}
                          {['pendiente', 'confirmada'].includes(c.estado) && (
                            <Btn size="sm" variant="danger" onClick={() => cambiarEstado(c.id, 'cancelada')}>Cancelar</Btn>
                          )}
                        </div>
                      </TD>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {modal && (
        <Modal title={modal === 'new' ? 'Nueva cita' : 'Editar cita'} onClose={() => setModal(null)} maxWidth="max-w-xl">
          <ErrorMsg msg={error} />
          <form onSubmit={guardar} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Fecha *" type="date" required value={form.fecha} onChange={e => setFrm({ fecha: e.target.value })} />
              <Input label="Hora *" type="time" required value={form.hora} onChange={e => setFrm({ hora: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select label="Sede *" required value={form.sede_id} onChange={onSedeChange}>
                <option value="">Seleccionar...</option>
                {sedes.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
              </Select>
              <Select label="Veterinario *" required value={form.veterinario_id} onChange={e => setFrm({ veterinario_id: e.target.value })} disabled={!form.sede_id}>
                <option value="">{form.sede_id ? 'Seleccionar...' : 'Primero elige la sede'}</option>
                {vets.map(v => <option key={v.id} value={v.id}>{v.nombre}</option>)}
              </Select>
            </div>
            {modal === 'new' && (
              <div className="grid grid-cols-2 gap-4">
                <Select label="Cliente *" required value={clienteId} onChange={onClienteChange}>
                  <option value="">Seleccionar...</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </Select>
                <Select label="Mascota *" required value={form.mascota_id} onChange={e => setFrm({ mascota_id: e.target.value })} disabled={!clienteId}>
                  <option value="">Seleccionar...</option>
                  {mascotas.map(m => <option key={m.id} value={m.id}>{m.nombre} ({m.especie})</option>)}
                </Select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <Select label="Prioridad" value={form.prioridad} onChange={e => setFrm({ prioridad: e.target.value })}>
                {PRIORIDADES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </Select>
              <Input label="Motivo" value={form.motivo} onChange={e => setFrm({ motivo: e.target.value })} />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Btn variant="ghost" onClick={() => setModal(null)}>Cancelar</Btn>
              <Btn type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar cita'}</Btn>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
