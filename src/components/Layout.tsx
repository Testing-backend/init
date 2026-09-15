import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ThemeToggle } from './ThemeToggle'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Demo user'

  return (
    <div className="min-h-[100dvh] mesh-bg">
      <div className="pointer-events-none fixed inset-0 noise-overlay" aria-hidden="true" />
      <header className="sticky top-0 z-30 safe-area-pt safe-area-px">
        <div className="mx-auto w-full max-w-2xl page-pad-x pt-3">
          <div className="flex items-center gap-3 rounded-2xl border border-white/70 dark:border-surface-700/60 bg-white/75 dark:bg-surface-900/70 backdrop-blur-xl px-4 py-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-700 text-white text-sm font-bold">
              V
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-sm font-bold text-surface-900 dark:text-white truncate">VeriFi AI</p>
              <p className="text-xs text-surface-500 truncate">{name}</p>
            </div>
            <ThemeToggle />
            <button
              type="button"
              onClick={() => logout().then(() => navigate('/login'))}
              className="text-sm font-semibold text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white px-2 py-1 rounded-lg"
            >
              Log out
            </button>
          </div>
        </div>
      </header>
      <main className="relative mx-auto w-full max-w-2xl page-pad-x pt-6 pb-16">
        <Outlet />
      </main>
    </div>
  )
}
