import React, { useState } from 'react'
import { Save, Trash2, FolderOpen, X } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { Button } from './ui/Button'
import { Card } from './ui/Card'
import type { SavedScenario, DCAInputs } from '../types'

interface ScenarioManagerProps {
  currentInputs: DCAInputs
  onLoad: (inputs: DCAInputs) => void
}

export function ScenarioManager({ currentInputs, onLoad }: ScenarioManagerProps) {
  const [scenarios, setScenarios] = useLocalStorage<SavedScenario[]>('satstacker-scenarios', [])
  const [isOpen, setIsOpen] = useState(false)
  const [scenarioName, setScenarioName] = useState('')
  const [saving, setSaving] = useState(false)

  const saveScenario = () => {
    if (!scenarioName.trim()) return
    const scenario: SavedScenario = {
      id: crypto.randomUUID(),
      name: scenarioName.trim(),
      type: 'dca',
      inputs: currentInputs,
      savedAt: new Date().toISOString(),
    }
    setScenarios([scenario, ...scenarios])
    setScenarioName('')
    setSaving(false)
  }

  const deleteScenario = (id: string) => {
    setScenarios(scenarios.filter((s) => s.id !== id))
  }

  const loadScenario = (scenario: SavedScenario) => {
    onLoad(scenario.inputs as DCAInputs)
    setIsOpen(false)
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setSaving(true)}
          className="gap-1.5"
        >
          <Save className="w-3.5 h-3.5" />
          Save
        </Button>
        {scenarios.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(true)}
            className="gap-1.5"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            Saved ({scenarios.length})
          </Button>
        )}
      </div>

      {/* Save dialog */}
      {saving && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-sm animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Save Scenario</h3>
              <button onClick={() => setSaving(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <input
              autoFocus
              type="text"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveScenario()}
              placeholder="e.g. Aggressive 10yr plan"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm
                focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/70
                placeholder:text-zinc-600 mb-4"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" size="sm" onClick={() => setSaving(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={saveScenario}
                disabled={!scenarioName.trim()}
              >
                Save Scenario
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Load dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-white">Saved Scenarios</h3>
              <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {scenarios.map((scenario) => (
                <div
                  key={scenario.id}
                  className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg border border-zinc-700 hover:border-zinc-600 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{scenario.name}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {new Date(scenario.savedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="secondary" onClick={() => loadScenario(scenario)}>
                      Load
                    </Button>
                    <button
                      onClick={() => deleteScenario(scenario.id)}
                      className="text-zinc-600 hover:text-red-400 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </>
  )
}
