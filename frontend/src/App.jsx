import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Clientes from './pages/Clientes'
import Citas from './pages/Citas'
import Historial from './pages/Historial'
import Emergencias from './pages/Emergencias'
import Layout from './components/Layout'
import CambiarPassword from './pages/CambiarPassword'
import Administracion from './pages/Administracion'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <div style={{ padding: 40 }}>Cargando...</div>
  if (!user) return <Navigate to="/login" replace />
  if (user.debe_cambiar_password && location.pathname !== '/cambiar-password') {
    return <Navigate to="/cambiar-password" replace />
  }
  return children
}

function RoleRoute({ roles, children }) {
  const { user } = useAuth()
  if (!roles.includes(user?.rol)) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/cambiar-password"
            element={<ProtectedRoute><CambiarPassword /></ProtectedRoute>}
          />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="clientes" element={<RoleRoute roles={['admin', 'recepcionista', 'veterinario']}><Clientes /></RoleRoute>} />
                    <Route path="citas" element={<Citas />} />
                    <Route path="historial" element={<RoleRoute roles={['admin', 'veterinario']}><Historial /></RoleRoute>} />
                    <Route path="emergencias" element={<RoleRoute roles={['admin', 'veterinario']}><Emergencias /></RoleRoute>} />
                    <Route path="administracion" element={<RoleRoute roles={['admin', 'recepcionista']}><Administracion /></RoleRoute>} />
                    <Route path="facturacion" element={<RoleRoute roles={['admin', 'recepcionista']}><Administracion initialTab="facturas" /></RoleRoute>} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
