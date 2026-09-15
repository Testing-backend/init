import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ThemeToggle } from '../components/ThemeToggle'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { loginInterview } = useAuth()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const start = async () => {
    setBusy(true)
    setError(null)
    try {
      await loginInterview('user')
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-[100dvh] relative flex flex-col overflow-hidden safe-area-px mesh-bg">
      <div className="pointer-events-none absolute inset-0 noise-overlay" aria-hidden="true" />
      <header className="relative z-10 flex items-center justify-between px-5 sm:px-8 pt-5">
        <span className="font-display text-lg font-bold text-surface-900 dark:text-white">VeriFi AI</span>
        <ThemeToggle />
      </header>
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 pb-16">
        <div className="w-full max-w-[400px] text-center">
          <p className="page-eyebrow">10–15 min interview</p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-surface-900 dark:text-white">
            Savings goals
          </h1>
          <p className="mt-3 text-surface-600 dark:text-surface-300">
            Sign in, then make the list and “Add goal” work.
          </p>
          <div className="mt-8 glass-panel rounded-2xl p-6 text-left space-y-3">
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                {error}
              </p>
            )}
            <Button fullWidth disabled={busy} onClick={() => void start()}>
              {busy ? 'Signing in…' : 'Continue as demo user'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
