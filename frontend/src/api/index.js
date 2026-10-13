const BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}` : '/api'

function headers() {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function request(method, path, body) {
  const opts = { method, headers: headers() }
  if (body !== undefined) opts.body = JSON.stringify(body)
  const res = await fetch(`${BASE}${path}`, opts)
  if (res.status === 401) {
    localStorage.removeItem('token')
    window.location.href = '/login'
    return
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.detail || `Error ${res.status}`)
  return data
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  patch: (path, body) => request('PATCH', path, body),
  del: (path) => request('DELETE', path),
}

// Auth
export const authApi = {
  login: (email, password) => {
    const form = new URLSearchParams({ username: email, password })
    return fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form,
    }).then(async (res) => {
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Credenciales inválidas')
      return data
    })
  },
}

// Clientes
export const clientesApi = {
  listar: (search = '') => api.get(`/clientes${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  obtener: (id) => api.get(`/clientes/${id}`),
  crear: (data) => api.post('/clientes', data),
  actualizar: (id, data) => api.put(`/clientes/${id}`, data),
  mascotas: (id) => api.get(`/clientes/${id}/mascotas`),
  agregarMascota: (id, data) => api.post(`/clientes/${id}/mascotas`, data),
}

// Mascotas
export const mascotasApi = {
  actualizar: (id, data) => api.put(`/mascotas/${id}`, data),
}

// Citas
export const citasApi = {
  listar: (params = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v != null)).toString()
    return api.get(`/citas${qs ? `?${qs}` : ''}`)
  },
  obtener: (id) => api.get(`/citas/${id}`),
  crear: (data) => api.post('/citas', data),
  actualizar: (id, data) => api.put(`/citas/${id}`, data),
  cambiarEstado: (id, estado) => api.patch(`/citas/${id}/estado`, { estado }),
}

// Veterinarios
export const veterinariosApi = {
  listar: (sede_id) => api.get(`/veterinarios${sede_id != null ? `?sede_id=${sede_id}` : ''}`),
  crear: (data) => api.post('/veterinarios', data),
  actualizar: (id, data) => api.put(`/veterinarios/${id}`, data),
}

// Historial
export const historialApi = {
  porMascota: (mascota_id) => api.get(`/historial/mascota/${mascota_id}`),
  crear: (data) => api.post('/historial', data),
}

// Emergencias
export const emergenciasApi = {
  cola: (params = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v != null)).toString()
    return api.get(`/emergencias/cola${qs ? `?${qs}` : ''}`)
  },
}

// Sedes
export const sedesApi = {
  listar: () => api.get('/sedes'),
}
