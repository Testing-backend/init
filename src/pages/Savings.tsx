import { FormEvent, useEffect, useState } from 'react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { DataState } from '../components/ui/DataState'
import { api } from '../services/api'

interface Goal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
}

export default function Savings() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [targetAmount, setTargetAmount] = useState('')

  const load = () => {
    setLoading(true)
    setError(null)
    api
      .get<Goal[]>('/savings')
      .then(setGoals)
      .catch((err) => setError(err instanceof Error ? err.message : 'GET /api/savings failed'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const addGoal = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !targetAmount) return
    setSaving(true)
    setError(null)
    try {
      const created = await api.post<Goal>('/savings', {
        name: name.trim(),
        targetAmount: parseFloat(targetAmount),
      })
      setGoals((list) => [created, ...list])
      setName('')
      setTargetAmount('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'POST /api/savings failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="page-eyebrow">Interview task</p>
        <h1 className="page-title mt-1">Savings goals</h1>
        <p className="page-lede mt-1">Complete the two TODOs in savings.routes.ts so this page works.</p>
      </div>

      <Card>
        <form onSubmit={(e) => void addGoal(e)} className="space-y-4">
          <Input label="Goal name" value={name} onChange={setName} placeholder="Emergency fund" required />
          <Input
            label="Target amount ($)"
            type="number"
            value={targetAmount}
            onChange={setTargetAmount}
            placeholder="5000"
            required
          />
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Add goal'}
          </Button>
        </form>
      </Card>

      <DataState
        loading={loading}
        error={error}
        empty={!loading && !error && goals.length === 0}
        emptyMessage="No goals yet — add one above"
      >
        <div className="space-y-3">
          {goals.map((g) => {
            const current = Number(g.currentAmount ?? 0)
            const target = Number(g.targetAmount ?? 0)
            const pct = target > 0 ? Math.min(100, (current / target) * 100) : 0
            return (
              <Card key={g.id}>
                <div className="flex justify-between gap-3 mb-2">
                  <p className="font-medium text-surface-900 dark:text-white">{g.name}</p>
                  <p className="text-sm text-surface-500">
                    ${current.toLocaleString()} / ${target.toLocaleString()}
                  </p>
                </div>
                <div className="h-2 rounded-full bg-surface-100 dark:bg-surface-800 overflow-hidden">
                  <div className="h-full rounded-full bg-primary-600" style={{ width: `${pct}%` }} />
                </div>
              </Card>
            )
          })}
        </div>
      </DataState>
    </div>
  )
}
