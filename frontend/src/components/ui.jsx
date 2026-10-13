export function cn(...parts) {
  return parts.filter(Boolean).join(' ')
}

/* ------------------------------------------------------------------ */
/* Badge — estado / prioridad con punto indicador                      */
/* ------------------------------------------------------------------ */
const BADGE_MAP = {
  pendiente:   { cls: 'bg-amber-50 text-amber-700 border-amber-200',     dot: 'bg-amber-500' },
  confirmada:  { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  en_atencion: { cls: 'bg-blue-50 text-blue-700 border-blue-200',        dot: 'bg-blue-500' },
  finalizada:  { cls: 'bg-slate-50 text-slate-600 border-slate-200',     dot: 'bg-slate-400' },
  cancelada:   { cls: 'bg-red-50 text-red-700 border-red-200',           dot: 'bg-red-500' },
  alta:        { cls: 'bg-red-50 text-red-700 border-red-200',           dot: 'bg-red-500' },
  media:       { cls: 'bg-amber-50 text-amber-700 border-amber-200',     dot: 'bg-amber-500' },
  baja:        { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
}

export function Badge({ value, dot = true, className = '' }) {
  const cfg = BADGE_MAP[value] ?? { cls: 'bg-slate-50 text-slate-600 border-slate-200', dot: 'bg-slate-400' }
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border capitalize', cfg.cls, className)}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dot)} />}
      {value?.replace('_', ' ')}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/* Avatar — iniciales con color derivado del nombre                    */
/* ------------------------------------------------------------------ */
const AVATAR_COLORS = [
  'from-emerald-400 to-teal-500',
  'from-sky-400 to-blue-500',
  'from-violet-400 to-purple-500',
  'from-amber-400 to-orange-500',
  'from-rose-400 to-pink-500',
  'from-cyan-400 to-sky-500',
]

export function Avatar({ name = '', size = 'md', className = '' }) {
  const initials = name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?'
  const hash = [...name].reduce((a, c) => a + c.charCodeAt(0), 0)
  const gradient = AVATAR_COLORS[hash % AVATAR_COLORS.length]
  const sizes = { sm: 'w-7 h-7 text-[11px]', md: 'w-9 h-9 text-xs', lg: 'w-11 h-11 text-sm' }
  return (
    <span className={cn('inline-flex items-center justify-center rounded-full bg-gradient-to-br text-white font-semibold ring-2 ring-white shadow-sm flex-shrink-0', gradient, sizes[size], className)}>
      {initials}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/* Btn                                                                 */
/* ------------------------------------------------------------------ */
export function Btn({ children, onClick, type = 'button', variant = 'primary', size = 'md', disabled, className = '' }) {
  const base = 'inline-flex items-center justify-center gap-1.5 font-medium rounded-lg transition-all duration-150 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1'
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-5 py-2.5 text-sm' }
  const variants = {
    primary: 'bg-gradient-to-b from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white shadow-sm shadow-brand-600/20 focus-visible:ring-brand-500',
    success: 'bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-sm shadow-emerald-600/20 focus-visible:ring-emerald-500',
    danger:  'bg-gradient-to-b from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white shadow-sm shadow-red-500/20 focus-visible:ring-red-400',
    warning: 'bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white shadow-sm shadow-amber-500/20 focus-visible:ring-amber-400',
    ghost:   'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm focus-visible:ring-slate-300',
    subtle:  'bg-slate-100 hover:bg-slate-200 text-slate-700 focus-visible:ring-slate-300',
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cn(base, sizes[size], variants[variant], className)}>
      {children}
    </button>
  )
}

/* ------------------------------------------------------------------ */
/* Inputs                                                              */
/* ------------------------------------------------------------------ */
const FIELD = 'w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400 transition-all bg-white disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50'

export function Input({ label, hint, className = '', ...props }) {
  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>}
      <input className={FIELD} {...props} />
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  )
}

export function Select({ label, children, className = '', ...props }) {
  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>}
      <select className={cn(FIELD, 'pr-9 cursor-pointer')} {...props}>
        {children}
      </select>
    </div>
  )
}

export function Textarea({ label, className = '', rows = 3, ...props }) {
  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>}
      <textarea rows={rows} className={cn(FIELD, 'resize-none')} {...props} />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Modal                                                               */
/* ------------------------------------------------------------------ */
export function Modal({ title, subtitle, onClose, children, maxWidth = 'max-w-lg', accent = 'brand' }) {
  const accents = {
    brand: 'from-brand-500 to-teal-500',
    danger: 'from-red-500 to-rose-500',
    blue: 'from-sky-500 to-blue-500',
  }
  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className={cn('bg-white rounded-2xl shadow-2xl shadow-slate-900/20 w-full max-h-[90vh] overflow-hidden flex flex-col animate-scale-in', maxWidth)} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className={cn('w-1.5 h-8 rounded-full bg-gradient-to-b', accents[accent] ?? accents.brand)} />
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-800 truncate">{title}</h3>
              {subtitle && <p className="text-xs text-slate-400 truncate">{subtitle}</p>}
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg p-1.5 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Page header                                                         */
/* ------------------------------------------------------------------ */
export function PageHeader({ title, subtitle, icon, children }) {
  return (
    <div className="glass border-b border-slate-200/80 px-8 py-4 flex items-center justify-between flex-shrink-0 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        {icon && (
          <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-teal-600 text-white flex items-center justify-center shadow-sm shadow-brand-600/25">
            {icon}
          </span>
        )}
        <div>
          <h2 className="text-lg font-semibold text-slate-800 tracking-tight">{title}</h2>
          {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children && <div className="flex items-center gap-2.5">{children}</div>}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Card / Stat                                                         */
/* ------------------------------------------------------------------ */
export function Card({ children, className = '', hover = false }) {
  return (
    <div className={cn('bg-white rounded-2xl border border-slate-200/80 shadow-sm shadow-slate-200/50 overflow-hidden', hover && 'transition-all duration-200 hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5', className)}>
      {children}
    </div>
  )
}

export function StatCard({ label, value, icon, tone = 'brand', hint, loading }) {
  const tones = {
    brand: { bg: 'bg-brand-50', text: 'text-brand-600', ring: 'ring-brand-100', bar: 'from-brand-400 to-brand-600' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-500', ring: 'ring-amber-100', bar: 'from-amber-400 to-amber-500' },
    blue:  { bg: 'bg-blue-50', text: 'text-blue-500', ring: 'ring-blue-100', bar: 'from-sky-400 to-blue-500' },
    red:   { bg: 'bg-red-50', text: 'text-red-500', ring: 'ring-red-100', bar: 'from-red-400 to-red-500' },
  }
  const c = tones[tone] ?? tones.brand
  return (
    <Card hover className="p-5 relative">
      <span className={cn('absolute left-0 top-0 h-full w-1 bg-gradient-to-b', c.bar)} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1.5">{label}</p>
          {loading
            ? <span className="block h-8 w-12 skeleton" />
            : <p className="text-3xl font-bold text-slate-800 tracking-tight">{value}</p>}
          {hint && <p className="text-xs text-slate-400 mt-1.5">{hint}</p>}
        </div>
        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ring-4', c.bg, c.text, c.ring)}>
          {icon}
        </div>
      </div>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/* Feedback                                                            */
/* ------------------------------------------------------------------ */
export function ErrorMsg({ msg }) {
  if (!msg) return null
  return (
    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2 animate-fade-up">
      <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
      {msg}
    </div>
  )
}

export function EmptyState({ msg = 'Sin resultados', icon, action }) {
  return (
    <div className="text-center py-16 px-6 animate-fade-in">
      <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4">
        {icon || (
          <svg className="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </div>
      <p className="text-slate-500 text-sm">{msg}</p>
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  )
}

export function Spinner({ className = '' }) {
  return (
    <svg className={cn('animate-spin text-brand-500', className)} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* Table primitives                                                    */
/* ------------------------------------------------------------------ */
export const TH = ({ children, className = '' }) => (
  <th className={cn('px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 whitespace-nowrap', className)}>
    {children}
  </th>
)

export const TD = ({ children, className = '' }) => (
  <td className={cn('px-4 py-3 text-sm text-slate-700 border-t border-slate-100', className)}>
    {children}
  </td>
)
