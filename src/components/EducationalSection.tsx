import React, { useState } from 'react'
import {
  BookOpen,
  TrendingUp,
  AlertTriangle,
  Shuffle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react'
import { Card } from './ui/Card'

interface Section {
  id: string
  icon: React.ReactNode
  title: string
  content: React.ReactNode
}

const SECTIONS: Section[] = [
  {
    id: 'dca',
    icon: <TrendingUp className="w-5 h-5 text-orange-400" />,
    title: 'What is Dollar-Cost Averaging (DCA)?',
    content: (
      <div className="space-y-3 text-sm text-zinc-400 leading-relaxed">
        <p>
          Dollar-cost averaging is an investment strategy where you invest a fixed dollar amount
          at regular intervals — weekly or monthly — regardless of price. When prices are high,
          you buy fewer units. When prices are low, you buy more.
        </p>
        <p>
          Over time, this approach averages out your cost basis, reducing the risk of buying a
          large position at a market peak. It's particularly popular in volatile assets like Bitcoin
          because it removes the need to time the market.
        </p>
        <div className="p-3 rounded-lg bg-zinc-800/60 border border-zinc-700/50">
          <p className="text-zinc-300 font-medium mb-1">Example:</p>
          <p>
            If you invest $100/week and Bitcoin costs $50,000 one week and $40,000 the next,
            you'd buy 0.002 BTC and 0.0025 BTC respectively — more BTC at the lower price,
            automatically.
          </p>
        </div>
        <p>
          DCA doesn't guarantee profits and won't protect against long, sustained downtrends.
          But for conviction investors with a long time horizon, it's a disciplined, systematic
          strategy.
        </p>
      </div>
    ),
  },
  {
    id: 'volatility',
    icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
    title: 'Risks of Bitcoin Volatility',
    content: (
      <div className="space-y-3 text-sm text-zinc-400 leading-relaxed">
        <p>
          Bitcoin has historically experienced drawdowns of 50–85% from peak to trough —
          multiple times. A position worth $100,000 can become $15,000 within months.
          These aren't edge cases; they've happened repeatedly since Bitcoin's inception.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { year: '2011', drawdown: '93%' },
            { year: '2013–15', drawdown: '85%' },
            { year: '2017–18', drawdown: '83%' },
            { year: '2021–22', drawdown: '77%' },
          ].map(({ year, drawdown }) => (
            <div key={year} className="p-2.5 rounded-lg bg-red-500/5 border border-red-500/10 text-center">
              <p className="text-xs text-zinc-500">{year}</p>
              <p className="text-xl font-bold font-mono text-red-400">{drawdown}</p>
              <p className="text-xs text-zinc-600">drawdown</p>
            </div>
          ))}
        </div>
        <p>
          Volatility works in both directions — Bitcoin has also experienced 10–20× gains
          within single bull cycles. But you must be prepared to hold through multi-year
          bear markets without panic-selling.
        </p>
        <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/15 text-amber-400/80 text-xs">
          <AlertTriangle className="w-3.5 h-3.5 inline mr-1.5" />
          Only invest what you can afford to lose entirely. Bitcoin remains a highly
          speculative asset with no guaranteed return.
        </div>
      </div>
    ),
  },
  {
    id: 'scenarios',
    icon: <Shuffle className="w-5 h-5 text-blue-400" />,
    title: 'About Scenario Assumptions',
    content: (
      <div className="space-y-3 text-sm text-zinc-400 leading-relaxed">
        <p>
          The scenarios in this tool — bear, base, and bull — are user-defined assumptions,
          not predictions. Nobody knows what Bitcoin will be worth in 5 or 10 years.
        </p>
        <p>
          When choosing appreciation rates, consider:
        </p>
        <ul className="space-y-2 list-none">
          {[
            { label: 'Historical context', desc: "Bitcoin's CAGR from 2013–2023 was approximately 100–120%. This rate is unlikely to persist indefinitely as the asset matures." },
            { label: 'Stock-to-flow', desc: 'Some models predict continued appreciation due to Bitcoin\'s programmatic supply halvings every ~4 years.' },
            { label: 'Adoption curves', desc: 'If Bitcoin becomes global reserve currency or significant share of global wealth, prices could be orders of magnitude higher. If it fails, it could go to zero.' },
            { label: 'Regression to mean', desc: 'As Bitcoin matures and market cap grows, the law of large numbers suggests returns will moderate.' },
          ].map(({ label, desc }) => (
            <li key={label} className="flex gap-2">
              <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
              <span><strong className="text-zinc-300">{label}:</strong> {desc}</span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-zinc-500 italic">
          All numbers in this tool are illustrative. Run multiple scenarios and treat optimistic
          projections with healthy skepticism.
        </p>
      </div>
    ),
  },
  {
    id: 'montecarlo',
    icon: <Shuffle className="w-5 h-5 text-purple-400" />,
    title: 'How Monte Carlo Simulation Works',
    content: (
      <div className="space-y-3 text-sm text-zinc-400 leading-relaxed">
        <p>
          Monte Carlo simulation runs hundreds or thousands of randomized scenarios using
          statistical models, then shows the distribution of possible outcomes. Instead
          of one projected line, you see a range of plausible futures.
        </p>
        <p>
          This tool uses a <strong className="text-zinc-300">log-normal return model</strong>:
          each year's Bitcoin return is drawn randomly from a log-normal distribution parameterized
          by your mean return and volatility inputs. Log-normal is used because:
        </p>
        <ul className="space-y-1.5 pl-3 border-l border-zinc-700">
          <li>Asset prices can't go below zero</li>
          <li>Returns are multiplicative, not additive</li>
          <li>It produces the right-skewed distribution common in volatile assets</li>
        </ul>
        <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/15 text-purple-300/80 text-xs">
          <HelpCircle className="w-3.5 h-3.5 inline mr-1.5" />
          The 10th–90th percentile band covers 80% of simulated outcomes. Real Bitcoin may
          exhibit "fat tails" — more extreme events than a normal distribution predicts.
          This model has known limitations.
        </div>
      </div>
    ),
  },
  {
    id: 'risk',
    icon: <AlertTriangle className="w-5 h-5 text-red-400" />,
    title: 'Bitcoin is High Risk',
    content: (
      <div className="space-y-3 text-sm text-zinc-400 leading-relaxed">
        <p>
          Bitcoin is one of the most volatile assets ever created. While it has produced
          extraordinary returns for early holders, it has also inflicted severe losses on
          those who bought at peaks or used leverage.
        </p>
        <div className="space-y-2">
          {[
            'Bitcoin has no guaranteed return or underlying cash flow',
            'Regulatory risk: governments can restrict or ban it',
            'Technical risk: protocol vulnerabilities or quantum computing threats',
            'Exchange risk: custodian failures (Mt. Gox, FTX)',
            'Behavioral risk: panic-selling during drawdowns locks in losses',
            'Concentration risk: putting too much in any single asset',
          ].map((risk) => (
            <div key={risk} className="flex items-start gap-2">
              <span className="mt-1 w-1 h-1 rounded-full bg-red-500 shrink-0" />
              <span className="text-sm text-zinc-400">{risk}</span>
            </div>
          ))}
        </div>
        <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/15 text-red-400/80 text-xs font-medium">
          This tool is for educational and planning purposes only. It does not constitute
          financial, investment, or tax advice. Past performance does not guarantee future results.
          Consult a qualified financial advisor before making investment decisions.
        </div>
      </div>
    ),
  },
  {
    id: 'about',
    icon: <BookOpen className="w-5 h-5 text-zinc-400" />,
    title: 'About SatStacker',
    content: (
      <div className="space-y-3 text-sm text-zinc-400 leading-relaxed">
        <p>
          SatStacker is an open-source Bitcoin wealth planning tool. Everything runs in
          your browser — no data leaves your device. Your inputs are saved locally to
          localStorage only.
        </p>
        <p>
          The goal is to help Bitcoiners think in longer time horizons, stress-test their
          DCA strategies, and understand the range of possible outcomes — without the
          hype of a typical crypto app.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-300 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            View on GitHub
          </a>
          <a
            href="https://bitcoin.org/bitcoin.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-300 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Bitcoin Whitepaper
          </a>
        </div>
      </div>
    ),
  },
]

export function EducationalSection() {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['dca']))

  const toggle = (id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <div className="space-y-3 max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white mb-1">Learn the Basics</h2>
        <p className="text-sm text-zinc-500">
          Understand the concepts behind the tools before making decisions.
        </p>
      </div>
      {SECTIONS.map((section) => {
        const isOpen = openSections.has(section.id)
        return (
          <Card key={section.id} className="p-0 overflow-hidden">
            <button
              onClick={() => toggle(section.id)}
              className="w-full flex items-center justify-between p-5 text-left hover:bg-zinc-800/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                {section.icon}
                <span className="font-medium text-white text-sm">{section.title}</span>
              </div>
              {isOpen ? (
                <ChevronUp className="w-4 h-4 text-zinc-500 shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0" />
              )}
            </button>
            {isOpen && (
              <div className="px-5 pb-5 border-t border-zinc-800 pt-4 animate-fade-in">
                {section.content}
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}
