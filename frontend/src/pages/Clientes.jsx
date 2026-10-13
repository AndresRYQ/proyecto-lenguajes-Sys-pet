import { useEffect, useState } from 'react'
import { clientesApi } from '../api'
import { Btn, Input, Modal, PageHeader, Card, ErrorMsg, EmptyState, TH, TD, Avatar, Spinner } from '../components/ui'

const emptyCliente = { nombre: '', telefono: '', email: '' }
const emptyMascota = { nombre: '', especie: '', raza: '', edad: '' }

const SPECIES_ICON = {
  perro: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
}

export default function Clientes() {
  const [clientes, setClientes] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalCliente, setModalCliente] = useState(null)
  const [modalMascota, setModalMascota] = useState(null)
  const [detalle, setDetalle] = useState(null)
  const [formCliente, setFormCliente] = useState(emptyCliente)
  const [formMascota, setFormMascota] = useState(emptyMascota)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function cargar(q = '') {
    setLoading(true)
    try { setClientes(await clientesApi.listar(q)) } finally { setLoading(false) }
  }

  useEffect(() => { cargar() }, [])

  async function guardarCliente(e) {
    e.preventDefault(); setSaving(true); setError('')
    try {
      const p = { ...formCliente, telefono: formCliente.telefono || null, email: formCliente.email || null }
      modalCliente === 'new' ? await clientesApi.crear(p) : await clientesApi.actualizar(modalCliente.id, p)
      setModalCliente(null); cargar(search)
    } catch (err) { setError(err.message) } finally { setSaving(false) }
  }

  async function verDetalle(c) {
    const mascotas = await clientesApi.mascotas(c.id)
    setDetalle({ ...c, mascotas })
  }

  async function guardarMascota(e) {
    e.preventDefault(); setSaving(true); setError('')
    try {
      const p = { ...formMascota, edad: formMascota.edad ? parseInt(formMascota.edad) : null, cliente_id: modalMascota }
      await clientesApi.agregarMascota(modalMascota, p)
      const mascotas = await clientesApi.mascotas(modalMascota)
      if (detalle?.id === modalMascota) setDetalle(d => ({ ...d, mascotas }))
      setModalMascota(null); setFormMascota(emptyMascota)
    } catch (err) { setError(err.message) } finally { setSaving(false) }
  }

  const setFc = v => setFormCliente(p => ({ ...p, ...v }))

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <PageHeader
        title="Clientes y Mascotas"
        subtitle={`${clientes.length} ${clientes.length === 1 ? 'cliente registrado' : 'clientes registrados'}`}
        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
      >
        <Btn onClick={() => { setFormCliente(emptyCliente); setError(''); setModalCliente('new') }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Nuevo cliente
        </Btn>
      </PageHeader>

      <div className="p-6 lg:p-8 animate-fade-up">
        <form className="flex flex-wrap gap-3 mb-6" onSubmit={e => { e.preventDefault(); cargar(search) }}>
          <div className="relative flex-1 max-w-sm">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </span>
            <input
              className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400 bg-white"
              placeholder="Buscar por nombre, teléfono o email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Btn type="submit" variant="ghost">Buscar</Btn>
          {search && <Btn variant="subtle" onClick={() => { setSearch(''); cargar('') }}>Limpiar</Btn>}
        </form>

        <Card>
          {loading ? (
            <div className="p-10 flex flex-col items-center gap-3 text-slate-400 text-sm"><Spinner className="w-6 h-6" />Cargando clientes...</div>
          ) : clientes.length === 0 ? <EmptyState msg="No se encontraron clientes" /> : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr><TH className="w-12">#</TH><TH>Cliente</TH><TH>Teléfono</TH><TH>Email</TH><TH className="text-right">Acciones</TH></tr></thead>
                <tbody>
                  {clientes.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      <TD className="text-slate-400 text-xs">{String(c.id).padStart(3, '0')}</TD>
                      <TD>
                        <div className="flex items-center gap-3">
                          <Avatar name={c.nombre} size="md" />
                          <span className="font-medium text-slate-800">{c.nombre}</span>
                        </div>
                      </TD>
                      <TD>{c.telefono || <span className="text-slate-300">—</span>}</TD>
                      <TD>{c.email || <span className="text-slate-300">—</span>}</TD>
                      <TD>
                        <div className="flex gap-2 justify-end">
                          <Btn size="sm" variant="ghost" onClick={() => verDetalle(c)}>Ver mascotas</Btn>
                          <Btn size="sm" variant="subtle" onClick={() => { setFormCliente({ nombre: c.nombre, telefono: c.telefono || '', email: c.email || '' }); setError(''); setModalCliente(c) }}>Editar</Btn>
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

      {modalCliente && (
        <Modal title={modalCliente === 'new' ? 'Nuevo cliente' : 'Editar cliente'} subtitle="Datos de contacto del propietario" onClose={() => setModalCliente(null)}>
          <ErrorMsg msg={error} />
          <form onSubmit={guardarCliente} className="space-y-4">
            <Input label="Nombre *" required placeholder="Nombre completo" value={formCliente.nombre} onChange={e => setFc({ nombre: e.target.value })} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Teléfono" placeholder="+51 999 999 999" value={formCliente.telefono} onChange={e => setFc({ telefono: e.target.value })} />
              <Input label="Email" type="email" placeholder="correo@ejemplo.com" value={formCliente.email} onChange={e => setFc({ email: e.target.value })} />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Btn variant="ghost" onClick={() => setModalCliente(null)}>Cancelar</Btn>
              <Btn type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Btn>
            </div>
          </form>
        </Modal>
      )}

      {detalle && (
        <Modal title={`Mascotas de ${detalle.nombre}`} subtitle={`${detalle.mascotas?.length ?? 0} registradas`} onClose={() => setDetalle(null)} maxWidth="max-w-2xl" accent="blue">
          {detalle.mascotas?.length === 0 ? (
            <EmptyState msg="Sin mascotas registradas" />
          ) : (
            <div className="grid sm:grid-cols-2 gap-3 mb-4">
              {detalle.mascotas?.map(m => (
                <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-100 to-teal-100 text-brand-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={SPECIES_ICON.perro} /></svg>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 text-sm truncate">{m.nombre}</p>
                    <p className="text-xs text-slate-500 truncate">
                      {m.especie}{m.raza ? ` · ${m.raza}` : ''}{m.edad != null ? ` · ${m.edad} años` : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Btn variant="ghost" onClick={() => setDetalle(null)}>Cerrar</Btn>
            <Btn onClick={() => { setFormMascota(emptyMascota); setError(''); setModalMascota(detalle.id) }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Agregar mascota
            </Btn>
          </div>
        </Modal>
      )}

      {modalMascota && (
        <Modal title="Nueva mascota" subtitle="Registra un nuevo paciente" onClose={() => setModalMascota(null)} accent="blue">
          <ErrorMsg msg={error} />
          <form onSubmit={guardarMascota} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Nombre *" required placeholder="Ej. Firulais" value={formMascota.nombre} onChange={e => setFormMascota(p => ({ ...p, nombre: e.target.value }))} />
              <Input label="Especie *" required placeholder="Perro, Gato..." value={formMascota.especie} onChange={e => setFormMascota(p => ({ ...p, especie: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Raza" placeholder="Ej. Labrador" value={formMascota.raza} onChange={e => setFormMascota(p => ({ ...p, raza: e.target.value }))} />
              <Input label="Edad (años)" type="number" min="0" placeholder="0" value={formMascota.edad} onChange={e => setFormMascota(p => ({ ...p, edad: e.target.value }))} />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Btn variant="ghost" onClick={() => setModalMascota(null)}>Cancelar</Btn>
              <Btn type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Btn>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
