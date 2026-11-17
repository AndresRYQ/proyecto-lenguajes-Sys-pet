import { useEffect, useMemo, useState } from 'react'
import { facturasApi, sedesApi, usuariosApi, veterinariosApi } from '../api'
import { Btn, Card, EmptyState, ErrorMsg, Input, Modal, PageHeader, Select, Spinner, TD, TH } from '../components/ui'
import { useAuth } from '../context/AuthContext'

const TABS = [
  { id: 'usuarios', label: 'Usuarios', admin: true },
  { id: 'veterinarios', label: 'Veterinarios', admin: true },
  { id: 'sedes', label: 'Sedes', admin: true },
  { id: 'facturas', label: 'Facturación', admin: false },
]

const initialUser = { nombre: '', email: '', rol: 'recepcionista', sede_id: '', password: '' }
const initialVet = { nombre: '', especialidad: '', sede_id: '' }
const initialSede = { nombre: '', direccion: '' }
const initialFactura = { fecha: new Date().toISOString().slice(0, 10), total: '', cita_id: '' }

export default function Administracion({ initialTab = 'usuarios' }) {
  const { user } = useAuth()
  const [tab, setTab] = useState(user?.rol === 'recepcionista' ? 'facturas' : initialTab)
  const [rows, setRows] = useState([])
  const [sedes, setSedes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(initialUser)
  const visibleTabs = TABS.filter(item => !item.admin || user?.rol === 'admin')
  const filtered = useMemo(() => {
    const term = filter.trim().toLowerCase()
    if (!term) return rows
    return rows.filter(row => JSON.stringify(row).toLowerCase().includes(term))
  }, [filter, rows])

  async function load() {
    setLoading(true)
    setError('')
    try {
      if (user?.rol === 'admin') {
        const [allSedes] = await Promise.all([sedesApi.listar()])
        setSedes(allSedes)
      } else {
        setSedes([await sedesApi.miSede()])
      }
      if (tab === 'usuarios' && user?.rol === 'admin') setRows(await usuariosApi.listar())
      else if (tab === 'veterinarios') setRows(await veterinariosApi.listar(null, user?.rol === 'admin'))
      else if (tab === 'sedes' && user?.rol === 'admin') setRows(await sedesApi.listar())
      else if (tab === 'facturas') setRows(await facturasApi.listar())
      else setRows([])
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [tab])
  useEffect(() => {
    if (user?.rol === 'recepcionista') setTab('facturas')
  }, [user?.rol])

  function openCreate() {
    setError('')
    setEditing('new')
    if (tab === 'usuarios') setForm({ ...initialUser, sede_id: String(sedes[0]?.id || '') })
    if (tab === 'veterinarios') setForm({ ...initialVet, sede_id: String(sedes[0]?.id || '') })
    if (tab === 'sedes') setForm(initialSede)
    if (tab === 'facturas') setForm(initialFactura)
  }

  function openEdit(row) {
    setError('')
    setEditing(row)
    if (tab === 'usuarios') setForm({ nombre: row.nombre, email: row.email, rol: row.rol, sede_id: String(row.sede_id), password: '' })
    if (tab === 'veterinarios') setForm({ nombre: row.nombre, especialidad: row.especialidad || '', sede_id: String(row.sede_id), activo: row.activo })
    if (tab === 'sedes') setForm({ nombre: row.nombre, direccion: row.direccion })
    if (tab === 'facturas') setForm({ fecha: row.fecha, total: String(row.total), cita_id: String(row.cita_id) })
  }

  function setField(key, value) {
    setForm(current => ({ ...current, [key]: value }))
  }

  async function save(event) {
    event.preventDefault()
    setError('')
    try {
      const isNew = editing === 'new'
      const id = editing?.id
      if (tab === 'usuarios') {
        const payload = { nombre: form.nombre, email: form.email, rol: form.rol, sede_id: Number(form.sede_id) }
        if (isNew) await usuariosApi.crear({ ...payload, password: form.password })
        else {
          await usuariosApi.actualizar(id, payload)
          if (form.password) await usuariosApi.restablecerPassword(id, form.password)
        }
      } else if (tab === 'veterinarios') {
        const payload = { nombre: form.nombre, especialidad: form.especialidad || null, sede_id: Number(form.sede_id), activo: form.activo ?? true }
        if (isNew) await veterinariosApi.crear(payload)
        else await veterinariosApi.actualizar(id, payload)
      } else if (tab === 'sedes') {
        const payload = { nombre: form.nombre, direccion: form.direccion }
        if (isNew) await sedesApi.crear(payload)
        else await sedesApi.actualizar(id, payload)
      } else if (tab === 'facturas') {
        const payload = { fecha: form.fecha, total: Number(form.total), cita_id: Number(form.cita_id) }
        if (isNew) await facturasApi.crear(payload)
        else await facturasApi.actualizar(id, { total: payload.total })
      }
      setEditing(null)
      await load()
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  async function toggleActive(row, activate) {
    try {
      if (tab === 'usuarios') await usuariosApi.activar(row.id, activate)
      else if (tab === 'sedes') await sedesApi.activar(row.id, activate)
      else await veterinariosApi.actualizar(row.id, { activo: activate })
      await load()
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  async function annulInvoice(row) {
    try {
      await facturasApi.anular(row.id)
      await load()
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const title = TABS.find(item => item.id === tab)?.label || 'Administración'
  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <PageHeader title={title} subtitle="Gestión de la clínica" />
      <div className="p-6 lg:p-8 space-y-5">
        <div className="flex flex-wrap gap-2">
          {visibleTabs.map(item => (
            <Btn key={item.id} variant={tab === item.id ? 'primary' : 'ghost'} onClick={() => { setTab(item.id); setFilter('') }}>
              {item.label}
            </Btn>
          ))}
        </div>
        <ErrorMsg msg={error} />
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-slate-100">
            <Input aria-label="Filtrar" placeholder="Filtrar resultados..." value={filter} onChange={event => setFilter(event.target.value)} className="w-full max-w-sm" />
            {tab !== 'facturas' || user?.rol === 'admin' || user?.rol === 'recepcionista'
              ? <Btn onClick={openCreate}>Nuevo registro</Btn>
              : null}
          </div>
          {loading ? <div className="p-10 flex justify-center"><Spinner className="w-6 h-6" /></div> : filtered.length === 0 ? (
            <EmptyState msg="No hay registros para mostrar" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr>
                  {(tab === 'usuarios' ? ['Nombre', 'Correo', 'Rol', 'Sede', 'Estado', 'Acciones']
                    : tab === 'veterinarios' ? ['Nombre', 'Especialidad', 'Sede', 'Estado', 'Acciones']
                      : tab === 'sedes' ? ['Sede', 'Dirección', 'Estado', 'Acciones']
                        : ['Factura', 'Fecha', 'Cita', 'Total', 'Estado', 'Acciones']).map(item => <TH key={item}>{item}</TH>)}
                </tr></thead>
                <tbody>
                  {filtered.map(row => (
                    <tr key={row.id} className="hover:bg-slate-50">
                      {tab === 'usuarios' && <>
                        <TD>{row.nombre}</TD><TD>{row.email}</TD><TD className="capitalize">{row.rol}</TD>
                        <TD>{sedes.find(sede => sede.id === row.sede_id)?.nombre || row.sede_id}</TD>
                        <TD>{row.activo ? 'Activo' : 'Inactivo'}</TD>
                        <TD><div className="flex gap-2"><Btn size="sm" variant="ghost" onClick={() => openEdit(row)}>Editar</Btn><Btn size="sm" variant="subtle" onClick={() => toggleActive(row, !row.activo)}>{row.activo ? 'Desactivar' : 'Activar'}</Btn></div></TD>
                      </>}
                      {tab === 'veterinarios' && <>
                        <TD>{row.nombre}</TD><TD>{row.especialidad || '—'}</TD>
                        <TD>{sedes.find(sede => sede.id === row.sede_id)?.nombre || row.sede_id}</TD>
                        <TD>{row.activo ? 'Activo' : 'Inactivo'}</TD>
                        <TD><div className="flex gap-2"><Btn size="sm" variant="ghost" onClick={() => openEdit(row)}>Editar</Btn><Btn size="sm" variant="subtle" onClick={() => toggleActive(row, !row.activo)}>{row.activo ? 'Desactivar' : 'Activar'}</Btn></div></TD>
                      </>}
                      {tab === 'sedes' && <>
                        <TD>{row.nombre}</TD><TD>{row.direccion}</TD><TD>{row.activo ? 'Activa' : 'Inactiva'}</TD>
                        <TD><div className="flex gap-2"><Btn size="sm" variant="ghost" onClick={() => openEdit(row)}>Editar</Btn><Btn size="sm" variant="subtle" onClick={() => toggleActive(row, !row.activo)}>{row.activo ? 'Desactivar' : 'Activar'}</Btn></div></TD>
                      </>}
                      {tab === 'facturas' && <>
                        <TD>#{row.id}</TD><TD>{row.fecha}</TD><TD>{row.cita_id}</TD><TD>S/ {Number(row.total).toFixed(2)}</TD><TD>{row.anulada ? 'Anulada' : 'Vigente'}</TD>
                        <TD><div className="flex gap-2"><Btn size="sm" variant="ghost" disabled={row.anulada} onClick={() => openEdit(row)}>Editar</Btn><Btn size="sm" variant="danger" disabled={row.anulada || user?.rol !== 'admin'} onClick={() => annulInvoice(row)}>Anular</Btn></div></TD>
                      </>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {editing && (
        <Modal title={`${editing === 'new' ? 'Crear' : 'Editar'} ${title.toLowerCase()}`} onClose={() => setEditing(null)}>
          <ErrorMsg msg={error} />
          <form onSubmit={save} className="space-y-4">
            {(tab === 'usuarios' || tab === 'veterinarios') && <>
              <Input label="Nombre" required minLength={2} maxLength={100} value={form.nombre || ''} onChange={event => setField('nombre', event.target.value)} />
              {tab === 'usuarios' && <>
                <Input label="Correo" type="email" required value={form.email || ''} onChange={event => setField('email', event.target.value)} />
                <Select label="Rol" value={form.rol} onChange={event => setField('rol', event.target.value)}>
                  <option value="admin">Administrador</option><option value="recepcionista">Recepcionista</option><option value="veterinario">Veterinario</option>
                </Select>
                <Input label={editing === 'new' ? 'Contraseña temporal' : 'Nueva contraseña temporal (opcional)'} type="password" minLength={12} maxLength={72} required={editing === 'new'} value={form.password || ''} onChange={event => setField('password', event.target.value)} />
              </>}
              {tab === 'veterinarios' && <Input label="Especialidad" maxLength={100} value={form.especialidad || ''} onChange={event => setField('especialidad', event.target.value)} />}
              <Select label="Sede" required value={form.sede_id || ''} onChange={event => setField('sede_id', event.target.value)}>
                <option value="">Seleccionar sede</option>{sedes.filter(sede => sede.activo).map(sede => <option key={sede.id} value={sede.id}>{sede.nombre}</option>)}
              </Select>
            </>}
            {tab === 'sedes' && <>
              <Input label="Nombre" required minLength={2} maxLength={50} value={form.nombre || ''} onChange={event => setField('nombre', event.target.value)} />
              <Input label="Dirección" required minLength={4} maxLength={200} value={form.direccion || ''} onChange={event => setField('direccion', event.target.value)} />
            </>}
            {tab === 'facturas' && <>
              <Input label="Fecha" type="date" required value={form.fecha || ''} onChange={event => setField('fecha', event.target.value)} />
              <Input label="Importe (S/)" type="number" step="0.01" min="0.01" required value={form.total || ''} onChange={event => setField('total', event.target.value)} />
              {editing === 'new' && <Input label="ID de cita" type="number" min="1" required value={form.cita_id || ''} onChange={event => setField('cita_id', event.target.value)} />}
            </>}
            <div className="flex justify-end gap-2">
              <Btn variant="ghost" onClick={() => setEditing(null)}>Cancelar</Btn>
              <Btn type="submit">Guardar</Btn>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
