'use client'

import { useWebSocket } from '@/hooks/use-websocket'
import { useState } from 'react'

const AVAILABLE_PAIRS = ['BTC/USD', 'ETH/USD', 'SOL/USD']

export default function HomePage() {
  const { status, signals, subscriptions, subscribe, unsubscribe } = useWebSocket()
  const [selectedPair, setSelectedPair] = useState('')

  const handleSubscribe = () => {
    if (selectedPair && !subscriptions.includes(selectedPair)) {
      subscribe([selectedPair])
    }
  }

  const handleUnsubscribe = (symbol: string) => {
    unsubscribe([symbol])
  }

  return (
    <main className="mx-auto max-w-3xl">      
      <h1 className="mb-6 text-4xl font-bold">Welcome to Our Docs</h1>
      <p className="mb-4">
        This is a gorgeous minimal documentation site built with Next.js,
        Tailwind CSS, and shadcn/ui components.
      </p>

      {/* Trading Signals Section */}
      <div className="my-8 space-y-6">
        <div className="rounded-lg border p-4">
          <h2 className="mb-4 text-2xl font-semibold">Trading Signals</h2>
          
          {/* Subscription Form */}
          <div className="mb-6">
            <h3 className="mb-2 text-lg font-medium">Subscribe to Trading Pairs</h3>
            <div className="flex gap-2">
              <select 
                value={selectedPair}
                onChange={(e) => setSelectedPair(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="">Select a pair</option>
                {AVAILABLE_PAIRS.map(pair => (
                  <option key={pair} value={pair}>{pair}</option>
                ))}
              </select>
              <button 
                onClick={handleSubscribe}
                disabled={!selectedPair || subscriptions.includes(selectedPair)}
                className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 disabled:bg-muted"
              >
                Subscribe
              </button>
            </div>
          </div>

          {/* Active Subscriptions */}
          <div className="mb-6">
            <h3 className="mb-2 text-lg font-medium">Active Subscriptions</h3>
            <div className="flex flex-wrap gap-2">
              {subscriptions.map(symbol => (
                <div key={symbol} className="flex items-center gap-2 rounded-full bg-muted px-3 py-1">
                  <span>{symbol}</span>
                  <button 
                    onClick={() => handleUnsubscribe(symbol)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Latest Signals */}
          <div>
            <h3 className="mb-2 text-lg font-medium">Latest Signals</h3>
            <div className="space-y-2">
              {signals.map((signal, index) => (
                <div key={index} className="rounded-md border p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{signal.symbol}</span>
                    <span className={`rounded px-2 py-1 text-sm ${
                      signal.action === 'BUY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {signal.action}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    <p>Price: ${signal.price.toLocaleString()}</p>
                    <p>Confidence: {(signal.confidence * 100).toFixed(1)}%</p>
                    <p>Time: {new Date(signal.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
              {signals.length === 0 && (
                <p className="text-sm text-muted-foreground">No signals received yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <div className="mt-4 flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${
            status === 'connected' ? 'bg-green-500' : 'bg-red-500'
          }`} />
          <span className="text-sm text-muted-foreground">
            {status === 'connected' ? 'Connected to server' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Rest of your existing content */}
      <h2 className="mb-4 mt-8 text-2xl font-semibold">Features</h2>
      <ul className="mb-4 list-inside list-disc space-y-1">
        <li>Clean and minimal design</li>
        <li>Dark mode support</li>
        <li>Responsive layout</li>
        <li>Easy navigation with shadcn sidebar</li>
        <li>Built with Next.js App Router</li>
        <li>Real-time trading signals</li>
      </ul>
      
      {/* ... rest of your existing JSX ... */}
    </main>
  )
} 