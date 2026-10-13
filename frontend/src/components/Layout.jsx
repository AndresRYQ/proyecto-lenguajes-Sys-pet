import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Avatar, cn } from './ui'

const ICON = {
  dashboard: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
  citas: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
  clientes: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />,
  historial: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
  emergencias: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />,
}

const GROUPS = [
  {
    label: 'General',
    items: [
      { to: '/dashboard', label: 'Dashboard', key: 'dashboard' },
      { to: '/citas', label: 'Citas', key: 'citas' },
    ],
  },
  {
    label: 'Gestión',
    items: [
      { to: '/clientes', label: 'Clientes y Mascotas', key: 'clientes' },
      { to: '/historial', label: 'Historial Clínico', key: 'historial' },
    ],
  },
  {
    label: 'Urgencias',
    items: [
      { to: '/emergencias', label: 'Emergencias', key: 'emergencias' },
    ],
  },
]

const ROL_LABEL = { admin: 'Administrador', recepcionista: 'Recepcionista', veterinario: 'Veterinario' }
const SEDE_LABEL = { 1: 'San Luis', 2: 'Surquillo' }

function NavItem({ to, label, iconKey, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-all duration-150',
          isActive
            ? 'bg-gradient-to-r from-brand-50 to-teal-50/40 text-brand-700 font-semibold shadow-sm'
            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
        )
      }
    >
      {({ isActive }) => (
        <>
          <span className={cn(
            'absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-gradient-to-b from-brand-400 to-teal-500 transition-all',
            isActive ? 'opacity-100' : 'opacity-0'
          )} />
          <span className={cn(
            'flex items-center justify-center w-8 h-8 rounded-lg transition-colors flex-shrink-0',
            isActive ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-400 group-hover:text-slate-600 group-hover:bg-white'
          )}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">{ICON[iconKey]}</svg>
          </span>
          <span className="truncate">{label}</span>
        </>
      )}
    </NavLink>
  )
}

function SidebarContent({ user, initials, onNavigate, onLogout }) {
  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-brand-600/30">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />
          </div>
          <div className="min-w-0">
            <p className="text-slate-900 font-semibold text-[13px] leading-tight truncate">Huellitas Felices</p>
            <p className="text-slate-400 text-[11px] truncate">Sistema de gestión</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {GROUPS.map(g => (
          <div key={g.label}>
            <p className="px-3 mb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{g.label}</p>
            <div className="space-y-0.5">
              {g.items.map(it => <NavItem key={it.to} to={it.to} label={it.label} iconKey={it.key} onClick={onNavigate} />)}
            </div>
          </div>
        ))}

        <div className="mx-1 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 p-4 text-white shadow-sm">
          <div className="flex items-center gap-2 mb-1.5">
            <svg className="w-4 h-4 text-brand-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p className="text-xs font-semibold">¿Necesitas ayuda?</p>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">Gestiona citas, pacientes e historiales de forma centralizada.</p>
        </div>
      </nav>

      <div className="p-3 border-t border-slate-100">
        <div className="flex items-center gap-2.5 rounded-xl p-2 hover:bg-slate-50 transition-colors">
          <Avatar name={user?.nombre || 'Usuario'} size="md" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-800 truncate">{user?.nombre}</p>
            <p className="text-[11px] text-slate-400 truncate">
              {ROL_LABEL[user?.rol] || user?.rol}
              {user?.sede_id && ` · ${SEDE_LABEL[user.sede_id] || `Sede ${user.sede_id}`}`}
            </p>
          </div>
          <button
            onClick={onLogout}
            title="Cerrar sesión"
            className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg p-1.5 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-800">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col flex-shrink-0">
        <SidebarContent user={user} onLogout={handleLogout} />
      </aside>

      {/* Sidebar mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-white shadow-2xl animate-slide-in">
            <SidebarContent user={user} onNavigate={() => setMobileOpen(false)} onLogout={handleLogout} />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200">
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <span className="font-semibold text-sm text-slate-800">Huellitas Felices</span>
        </div>

        <main className="flex-1 flex flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
