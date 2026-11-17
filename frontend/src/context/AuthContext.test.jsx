import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from './AuthContext'

function Harness() {
  const { user, passwordChanged } = useAuth()
  return (
    <div>
      <span>{user?.debe_cambiar_password ? 'change-required' : 'ready'}</span>
      <button onClick={passwordChanged}>Complete password change</button>
    </div>
  )
}

describe('AuthProvider', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('token', 'token')
    localStorage.setItem('user', JSON.stringify({
      nombre: 'Admin',
      rol: 'admin',
      sede_id: 1,
      debe_cambiar_password: true,
    }))
  })

  it('persists completion of the forced password change', async () => {
    render(<AuthProvider><Harness /></AuthProvider>)
    expect(await screen.findByText('change-required')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Complete password change' }))

    await waitFor(() => expect(screen.getByText('ready')).toBeInTheDocument())
    expect(JSON.parse(localStorage.getItem('user')).debe_cambiar_password).toBe(false)
  })
})
