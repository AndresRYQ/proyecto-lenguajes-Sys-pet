import { useEffect, useState } from 'react'
import { clientesApi } from '../api'
import { Btn, Input, Modal, PageHeader, Card, ErrorMsg, EmptyState, TH, TD } from '../components/ui'

const emptyCliente = { nombre: '', telefono: '', email: '' }
const emptyMascota = { nombre: '', especie: '', raza: '', edad: '' }

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
      <PageHeader title="Clientes y Mascotas" subtitle={`${clientes.length} clientes registrados`}>
        <Btn onClick={() => { setFormCliente(emptyCliente); setError(''); setModalCliente('new') }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Nuevo cliente
        </Btn>
      </PageHeader>

      <div className="p-8">
        <form className="flex gap-3 mb-6" onSubmit={e => { e.preventDefault(); cargar(search) }}>
          <input
            className="flex-1 max-w-sm px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            placeholder="Buscar por nombre, teléfono o email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <Btn type="submit" variant="ghost">Buscar</Btn>
          {search && <Btn variant="ghost" onClick={() => { setSearch(''); cargar('') }}>Limpiar</Btn>}
        </form>

        <Card>
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-sm">Cargando...</div>
          ) : clientes.length === 0 ? <EmptyState msg="No se encontraron clientes" /> : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr><TH>#</TH><TH>Nombre</TH><TH>Teléfono</TH><TH>Email</TH><TH>Acciones</TH></tr></thead>
                <tbody>
                  {clientes.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <TD className="text-slate-400 w-12">{c.id}</TD>
                      <TD><span className="font-medium text-slate-800">{c.nombre}</span></TD>
                      <TD>{c.telefono || <span className="text-slate-400">—</span>}</TD>
                      <TD>{c.email || <span className="text-slate-400">—</span>}</TD>
                      <TD>
                        <div className="flex gap-2">
                          <Btn size="sm" variant="ghost" onClick={() => verDetalle(c)}>Ver mascotas</Btn>
                          <Btn size="sm" variant="ghost" onClick={() => { setFormCliente({ nombre: c.nombre, telefono: c.telefono || '', email: c.email || '' }); setError(''); setModalCliente(c) }}>Editar</Btn>
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
        <Modal title={modalCliente === 'new' ? 'Nuevo cliente' : 'Editar cliente'} onClose={() => setModalCliente(null)}>
          <ErrorMsg msg={error} />
          <form onSubmit={guardarCliente} className="space-y-4">
            <Input label="Nombre *" required value={formCliente.nombre} onChange={e => setFc({ nombre: e.target.value })} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Teléfono" value={formCliente.telefono} onChange={e => setFc({ telefono: e.target.value })} />
              <Input label="Email" type="email" value={formCliente.email} onChange={e => setFc({ email: e.target.value })} />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Btn variant="ghost" onClick={() => setModalCliente(null)}>Cancelar</Btn>
              <Btn type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Btn>
            </div>
          </form>
        </Modal>
      )}

      {detalle && (
        <Modal title={`Mascotas de ${detalle.nombre}`} onClose={() => setDetalle(null)} maxWidth="max-w-2xl">
          {detalle.mascotas?.length === 0 ? (
            <EmptyState msg="Sin mascotas registradas" />
          ) : (
            <div className="overflow-x-auto mb-4">
              <table className="w-full">
                <thead><tr><TH>Nombre</TH><TH>Especie</TH><TH>Raza</TH><TH>Edad</TH></tr></thead>
                <tbody>
                  {detalle.mascotas?.map(m => (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <TD><span className="font-medium">{m.nombre}</span></TD>
                      <TD>{m.especie}</TD>
                      <TD>{m.raza || '—'}</TD>
                      <TD>{m.edad != null ? `${m.edad} años` : '—'}</TD>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <Btn variant="ghost" onClick={() => setDetalle(null)}>Cerrar</Btn>
            <Btn onClick={() => { setFormMascota(emptyMascota); setError(''); setModalMascota(detalle.id) }}>+ Agregar mascota</Btn>
          </div>
        </Modal>
      )}

      {modalMascota && (
        <Modal title="Nueva mascota" onClose={() => setModalMascota(null)}>
          <ErrorMsg msg={error} />
          <form onSubmit={guardarMascota} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Nombre *" required value={formMascota.nombre} onChange={e => setFormMascota(p => ({ ...p, nombre: e.target.value }))} />
              <Input label="Especie *" required placeholder="Perro, Gato..." value={formMascota.especie} onChange={e => setFormMascota(p => ({ ...p, especie: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Raza" value={formMascota.raza} onChange={e => setFormMascota(p => ({ ...p, raza: e.target.value }))} />
              <Input label="Edad (años)" type="number" min="0" value={formMascota.edad} onChange={e => setFormMascota(p => ({ ...p, edad: e.target.value }))} />
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
