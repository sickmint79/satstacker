import React, { useState } from 'react'
import { TrendingUp, Target, BarChart2, BookOpen } from 'lucide-react'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { DCASimulator } from './components/DCASimulator'
import { RetirementPlanner } from './components/RetirementPlanner'
import { MonteCarloView } from './components/MonteCarloView'
import { EducationalSection } from './components/EducationalSection'
import { useUnit } from './hooks/useUnit'
import type { ActiveTab } from './types'

const TABS: { id: ActiveTab; label: string; icon: React.ReactNode; description: string }[] = [
  {
    id: 'dca',
    label: 'DCA Simulator',
    icon: <TrendingUp className="w-4 h-4" />,
    description: 'Model dollar-cost averaging over time',
  },
  {
    id: 'retirement',
    label: 'Retirement Planner',
    icon: <Target className="w-4 h-4" />,
    description: 'Calculate how much BTC you need',
  },
  {
    id: 'montecarlo',
    label: 'Monte Carlo',
    icon: <BarChart2 className="w-4 h-4" />,
    description: 'Randomized outcome simulation',
  },
  {
    id: 'education',
    label: 'Learn',
    icon: <BookOpen className="w-4 h-4" />,
    description: 'Understand the concepts',
  },
]

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dca')
  const { unit, setUnit } = useUnit()

  return (
    <div className="min-h-screen bg-zinc-950 font-['Inter',_system-ui,_sans-serif]">
      <Header />

      {/* Tab Navigation */}
      <div className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex overflow-x-auto scrollbar-hide -mb-px gap-1 py-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg whitespace-nowrap
                  transition-all duration-150 shrink-0
                  ${
                    activeTab === tab.id
                      ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                  }
                `}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-fade-in" key={activeTab}>
          {activeTab === 'dca' && (
            <DCASimulator unit={unit} onUnitChange={setUnit} />
          )}
          {activeTab === 'retirement' && (
            <RetirementPlanner unit={unit} />
          )}
          {activeTab === 'montecarlo' && (
            <MonteCarloView unit={unit} />
          )}
          {activeTab === 'education' && (
            <EducationalSection />
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
