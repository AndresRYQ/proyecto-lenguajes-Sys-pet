export function Badge({ value }) {
  const map = {
    pendiente:   'bg-amber-100 text-amber-800',
    confirmada:  'bg-emerald-100 text-emerald-800',
    en_atencion: 'bg-blue-100 text-blue-800',
    finalizada:  'bg-slate-100 text-slate-600',
    cancelada:   'bg-red-100 text-red-700',
    alta:        'bg-red-100 text-red-700',
    media:       'bg-amber-100 text-amber-800',
    baja:        'bg-emerald-100 text-emerald-800',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${map[value] ?? 'bg-slate-100 text-slate-600'}`}>
      {value?.replace('_', ' ')}
    </span>
  )
}

export function Btn({ children, onClick, type = 'button', variant = 'primary', size = 'md', disabled, className = '' }) {
  const base = 'inline-flex items-center gap-1.5 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-5 py-2.5 text-sm' }
  const variants = {
    primary: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    danger:  'bg-red-500 hover:bg-red-600 text-white',
    ghost:   'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300',
    warning: 'bg-amber-500 hover:bg-amber-600 text-white',
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>
      {children}
    </button>
  )
}

export function Input({ label, ...props }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>}
      <input
        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white disabled:opacity-50 disabled:cursor-not-allowed"
        {...props}
      />
    </div>
  )
}

export function Select({ label, children, ...props }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>}
      <select
        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50"
        {...props}
      >
        {children}
      </select>
    </div>
  )
}

export function Modal({ title, onClose, children, maxWidth = 'max-w-lg' }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className={`bg-white rounded-xl shadow-xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between flex-shrink-0">
      <div>
        <h2 className="text-base font-semibold text-slate-800">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  )
}

export function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}>
      {children}
    </div>
  )
}

export function ErrorMsg({ msg }) {
  if (!msg) return null
  return (
    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
      <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
      {msg}
    </div>
  )
}

export function EmptyState({ msg = 'Sin resultados' }) {
  return (
    <div className="text-center py-16">
      <svg className="w-10 h-10 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p className="text-slate-400 text-sm">{msg}</p>
    </div>
  )
}

export const TH = ({ children }) => (
  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50">
    {children}
  </th>
)

export const TD = ({ children, className = '' }) => (
  <td className={`px-4 py-3 text-sm text-slate-700 border-t border-slate-100 ${className}`}>
    {children}
  </td>
)
