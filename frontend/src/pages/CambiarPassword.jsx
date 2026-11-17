import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api'
import { Btn, ErrorMsg, Input } from '../components/ui'
import { useAuth } from '../context/AuthContext'

export default function CambiarPassword() {
  const { user, passwordChanged, logout } = useAuth()
  const navigate = useNavigate()
  const [current, setCurrent] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('Las contraseñas nuevas no coinciden')
      return
    }
    setSaving(true)
    try {
      await authApi.cambiarPassword(current, password)
      passwordChanged()
      navigate('/dashboard', { replace: true })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  function signOut() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <form onSubmit={submit} className="w-full max-w-md space-y-4 rounded-2xl bg-white p-8 shadow">
        <h1 className="text-xl font-bold text-slate-800">Actualizar contraseña</h1>
        <p className="text-sm text-slate-500">
          {user?.debe_cambiar_password
            ? 'Por seguridad, cambia la contraseña temporal para continuar.'
            : 'Usa una contraseña nueva para tu cuenta.'}
        </p>
        <ErrorMsg msg={error} />
        {!user?.debe_cambiar_password && (
          <Input
            label="Contraseña actual"
            type="password"
            autoComplete="current-password"
            required
            value={current}
            onChange={event => setCurrent(event.target.value)}
          />
        )}
        <Input
          label="Nueva contraseña"
          type="password"
          minLength={12}
          maxLength={72}
          autoComplete="new-password"
          required
          value={password}
          onChange={event => setPassword(event.target.value)}
          hint="Usa al menos 12 caracteres."
        />
        <Input
          label="Confirmar contraseña"
          type="password"
          minLength={12}
          maxLength={72}
          autoComplete="new-password"
          required
          value={confirm}
          onChange={event => setConfirm(event.target.value)}
        />
        <div className="flex justify-between">
          <Btn variant="ghost" onClick={signOut}>Cerrar sesión</Btn>
          <Btn type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Cambiar contraseña'}</Btn>
        </div>
      </form>
    </main>
  )
}
