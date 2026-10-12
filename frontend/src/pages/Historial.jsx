import { useState, useEffect } from 'react'
import { clientesApi, historialApi, veterinariosApi } from '../api'
import { Btn, Modal, PageHeader, Card, ErrorMsg, EmptyState, Input, Select } from '../components/ui'

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
      <PageHeader title="Historial Clínico" subtitle="Registro médico por mascota" />

      <div className="flex flex-1 overflow-hidden">
        <div className="w-72 border-r border-slate-200 bg-white flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-slate-100">
            <form onSubmit={buscar} className="flex gap-2">
              <input
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Buscar cliente..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <Btn type="submit" size="sm">Ir</Btn>
            </form>
          </div>

          <div className="flex-1 overflow-y-auto">
            {clientes.length > 0 && (
              <div>
                <p className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100">Clientes</p>
                {clientes.map(c => (
                  <button key={c.id} onClick={() => selCliente(c)} className={`w-full text-left px-4 py-3 border-b border-slate-100 transition-colors ${clienteSelec?.id === c.id ? 'bg-emerald-50 border-l-2 border-l-emerald-500' : 'hover:bg-slate-50'}`}>
                    <p className={`text-sm font-medium ${clienteSelec?.id === c.id ? 'text-emerald-700' : 'text-slate-700'}`}>{c.nombre}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{c.telefono || c.email || '—'}</p>
                  </button>
                ))}
              </div>
            )}

            {mascotas.length > 0 && (
              <div>
                <p className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100">Mascotas</p>
                {mascotas.map(m => (
                  <button key={m.id} onClick={() => selMascota(m)} className={`w-full text-left px-4 py-3 border-b border-slate-100 transition-colors ${mascotaSelec?.id === m.id ? 'bg-emerald-50 border-l-2 border-l-emerald-500' : 'hover:bg-slate-50'}`}>
                    <p className={`text-sm font-medium ${mascotaSelec?.id === m.id ? 'text-emerald-700' : 'text-slate-700'}`}>{m.nombre}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{m.especie}{m.raza ? ` · ${m.raza}` : ''}</p>
                  </button>
                ))}
              </div>
            )}

            {clientes.length === 0 && (
              <div className="p-8 text-center">
                <svg className="w-8 h-8 text-slate-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-slate-400 text-sm">Busca un cliente para empezar</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {!mascotaSelec ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <svg className="w-10 h-10 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-slate-400 text-sm">Selecciona una mascota para ver su historial clínico</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-semibold text-slate-800">{mascotaSelec.nombre}</h3>
                  <p className="text-sm text-slate-500">{mascotaSelec.especie}{mascotaSelec.raza ? ` · ${mascotaSelec.raza}` : ''} · {clienteSelec?.nombre}</p>
                </div>
                <Btn onClick={abrirModal}>+ Nueva entrada</Btn>
              </div>

              {historias.length === 0 ? (
                <Card className="p-8"><EmptyState msg="Sin entradas en el historial" /></Card>
              ) : (
                <div className="space-y-4">
                  {historias.map(h => (
                    <Card key={h.id} className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-slate-700">{h.fecha}</span>
                        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">Dr/a. {h.veterinario_nombre || '—'}</span>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Diagnóstico</p>
                          <p className="text-sm text-slate-700">{h.diagnostico}</p>
                        </div>
                        {h.tratamiento && (
                          <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Tratamiento</p>
                            <p className="text-sm text-slate-700">{h.tratamiento}</p>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {modal && (
        <Modal title={`Nueva entrada — ${mascotaSelec?.nombre}`} onClose={() => setModal(false)}>
          <ErrorMsg msg={error} />
          <form onSubmit={guardar} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Fecha *" type="date" required value={form.fecha} onChange={e => setForm(p => ({ ...p, fecha: e.target.value }))} />
              <Select label="Veterinario *" required value={form.veterinario_id} onChange={e => setForm(p => ({ ...p, veterinario_id: e.target.value }))}>
                <option value="">Seleccionar...</option>
                {vets.map(v => <option key={v.id} value={v.id}>{v.nombre}</option>)}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Diagnóstico *</label>
              <textarea required rows={3} className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" value={form.diagnostico} onChange={e => setForm(p => ({ ...p, diagnostico: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Tratamiento</label>
              <textarea rows={3} className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" value={form.tratamiento} onChange={e => setForm(p => ({ ...p, tratamiento: e.target.value }))} />
            </div>
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
