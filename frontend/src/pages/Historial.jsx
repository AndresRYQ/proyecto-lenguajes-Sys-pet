import { useState, useEffect } from 'react'
import { clientesApi, historialApi, veterinariosApi } from '../api'
import { Btn, Modal, PageHeader, Card, ErrorMsg, EmptyState, Input, Select, Textarea, Avatar } from '../components/ui'

function ListButton({ active, onClick, title, subtitle, icon }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 border-b border-slate-100 transition-all flex items-center gap-3 ${
        active ? 'bg-gradient-to-r from-brand-50 to-teal-50/40 border-l-2 border-l-brand-500' : 'hover:bg-slate-50'
      }`}
    >
      {icon}
      <div className="min-w-0">
        <p className={`text-sm font-medium truncate ${active ? 'text-brand-700' : 'text-slate-700'}`}>{title}</p>
        <p className="text-xs text-slate-400 mt-0.5 truncate">{subtitle}</p>
      </div>
    </button>
  )
}

export default function Historial() {
  const [search, setSearch] = useState('')
  const [clientes, setClientes] = useState([])
  const [clienteSelec, setClienteSelec] = useState(null)
  const [mascotas, setMascotas] = useState([])
  const [mascotaSelec, setMascotaSelec] = useState(null)
  const [historias, setHistorias] = useState([])
  const [vets, setVets] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ fecha: '', diagnostico: '', tratamiento: '', mascota_id: '', veterinario_id: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { veterinariosApi.listar().then(setVets) }, [])

  async function buscar(e) {
    e.preventDefault()
    setClientes(await clientesApi.listar(search))
    setClienteSelec(null); setMascotas([]); setMascotaSelec(null); setHistorias([])
  }

  async function selCliente(c) {
    setClienteSelec(c)
    setMascotas(await clientesApi.mascotas(c.id))
    setMascotaSelec(null); setHistorias([])
  }

  async function selMascota(m) {
    setMascotaSelec(m)
    setHistorias(await historialApi.porMascota(m.id))
  }

  function abrirModal() {
    setForm({ fecha: new Date().toISOString().split('T')[0], diagnostico: '', tratamiento: '', mascota_id: String(mascotaSelec.id), veterinario_id: '' })
    setError(''); setModal(true)
  }

  async function guardar(e) {
    e.preventDefault(); setSaving(true); setError('')
    try {
      await historialApi.crear({ ...form, mascota_id: parseInt(form.mascota_id), veterinario_id: parseInt(form.veterinario_id) })
      setModal(false)
      setHistorias(await historialApi.porMascota(mascotaSelec.id))
    } catch (err) { setError(err.message) } finally { setSaving(false) }
  }

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <PageHeader
        title="Historial Clínico"
        subtitle="Registro médico por mascota"
        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="w-72 lg:w-80 border-r border-slate-200 bg-white flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-slate-100">
            <form onSubmit={buscar} className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </span>
                <input
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400"
                  placeholder="Buscar cliente..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <Btn type="submit" size="sm">Ir</Btn>
            </form>
          </div>

          <div className="flex-1 overflow-y-auto">
            {clientes.length > 0 && (
              <div>
                <p className="px-4 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100 sticky top-0">Clientes</p>
                {clientes.map(c => (
                  <ListButton
                    key={c.id}
                    active={clienteSelec?.id === c.id}
                    onClick={() => selCliente(c)}
                    title={c.nombre}
                    subtitle={c.telefono || c.email || '—'}
                    icon={<Avatar name={c.nombre} size="sm" />}
                  />
                ))}
              </div>
            )}

            {mascotas.length > 0 && (
              <div>
                <p className="px-4 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100 sticky top-0">Mascotas</p>
                {mascotas.map(m => (
                  <ListButton
                    key={m.id}
                    active={mascotaSelec?.id === m.id}
                    onClick={() => selMascota(m)}
                    title={m.nombre}
                    subtitle={`${m.especie}${m.raza ? ` · ${m.raza}` : ''}`}
                    icon={
                      <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                      </span>
                    }
                  />
                ))}
              </div>
            )}

            {clientes.length === 0 && (
              <div className="p-8 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <p className="text-slate-400 text-sm">Busca un cliente para empezar</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          {!mascotaSelec ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center animate-fade-in">
                <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <p className="text-slate-500 text-sm">Selecciona una mascota para ver su historial clínico</p>
              </div>
            </div>
          ) : (
            <div className="animate-fade-up">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <Avatar name={mascotaSelec.nombre} size="lg" />
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">{mascotaSelec.nombre}</h3>
                    <p className="text-sm text-slate-500">{mascotaSelec.especie}{mascotaSelec.raza ? ` · ${mascotaSelec.raza}` : ''} · <span className="text-slate-400">{clienteSelec?.nombre}</span></p>
                  </div>
                </div>
                <Btn onClick={abrirModal}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Nueva entrada
                </Btn>
              </div>

              {historias.length === 0 ? (
                <Card className="p-8"><EmptyState msg="Sin entradas en el historial" /></Card>
              ) : (
                <div className="relative pl-6">
                  <span className="absolute left-2 top-2 bottom-2 w-px bg-slate-200" />
                  <div className="space-y-4">
                    {historias.map(h => (
                      <div key={h.id} className="relative">
                        <span className="absolute -left-[18px] top-5 w-3 h-3 rounded-full bg-white border-2 border-brand-500" />
                        <Card className="p-5" hover>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-semibold text-slate-700">{h.fecha}</span>
                            <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">Dr/a. {h.veterinario_nombre || '—'}</span>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Diagnóstico</p>
                              <p className="text-sm text-slate-700 leading-relaxed">{h.diagnostico}</p>
                            </div>
                            {h.tratamiento && (
                              <div>
                                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Tratamiento</p>
                                <p className="text-sm text-slate-700 leading-relaxed">{h.tratamiento}</p>
                              </div>
                            )}
                          </div>
                        </Card>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {modal && (
        <Modal title="Nueva entrada" subtitle={mascotaSelec?.nombre} onClose={() => setModal(false)}>
          <ErrorMsg msg={error} />
          <form onSubmit={guardar} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Fecha *" type="date" required value={form.fecha} onChange={e => setForm(p => ({ ...p, fecha: e.target.value }))} />
              <Select label="Veterinario *" required value={form.veterinario_id} onChange={e => setForm(p => ({ ...p, veterinario_id: e.target.value }))}>
                <option value="">Seleccionar...</option>
                {vets.map(v => <option key={v.id} value={v.id}>{v.nombre}</option>)}
              </Select>
            </div>
            <Textarea label="Diagnóstico *" required rows={3} value={form.diagnostico} onChange={e => setForm(p => ({ ...p, diagnostico: e.target.value }))} />
            <Textarea label="Tratamiento" rows={3} value={form.tratamiento} onChange={e => setForm(p => ({ ...p, tratamiento: e.target.value }))} />
            <div className="flex justify-end gap-3 pt-2">
              <Btn variant="ghost" onClick={() => setModal(false)}>Cancelar</Btn>
              <Btn type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Btn>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
