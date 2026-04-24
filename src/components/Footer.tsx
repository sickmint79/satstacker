import React from 'react'
import { Bitcoin, Github, Heart } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-zinc-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center">
              <Bitcoin className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-white">
              Sat<span className="text-orange-400">Stacker</span>
            </span>
          </div>

          {/* Center links */}
          <div className="flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-1 text-sm text-zinc-500">
              <span>MIT Licensed</span>
              <span className="text-zinc-700">•</span>
              <span>Built for educational purposes</span>
              <span className="text-zinc-700">•</span>
              <span className="flex items-center gap-1">
                Made with <Heart className="w-3 h-3 text-orange-500 fill-orange-500" /> for Bitcoiners
              </span>
            </div>
            <p className="text-xs text-zinc-600">
              Not financial advice. All projections are hypothetical scenarios, not predictions.
            </p>
          </div>

          {/* GitHub */}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800
              hover:border-zinc-700 hover:bg-zinc-800 transition-all text-sm text-zinc-400 hover:text-white"
          >
            <Github className="w-4 h-4" />
            Open Source
          </a>
        </div>
      </div>
    </footer>
  )
}
