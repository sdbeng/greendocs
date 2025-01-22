'use client'

import { useWebSocket } from '@/hooks/use-websocket'
import { useState } from 'react'
import { AlertCircle } from 'lucide-react'

const AVAILABLE_PAIRS = ['BTC/USD', 'ETH/USD', 'SOL/USD']

export default function HomePage() {
  const { status, signals, subscriptions, subscribe, unsubscribe, error } = useWebSocket()
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
        <div className="rounded-lg border-2 border-primary/10 bg-card p-6 shadow-lg">
          <h2 className="mb-6 text-2xl font-bold text-primary">Trading Signals</h2>
          
          {/* Error Alert */}
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-md bg-destructive/15 p-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}

          {/* Subscription Form */}
          <div className="mb-6">
            <h3 className="mb-3 text-lg font-semibold">Subscribe to Trading Pairs</h3>
            <div className="flex gap-3">
              <select 
                value={selectedPair}
                onChange={(e) => setSelectedPair(e.target.value)}
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select a trading pair</option>
                {AVAILABLE_PAIRS.map(pair => (
                  <option key={pair} value={pair}>{pair}</option>
                ))}
              </select>
              <button 
                onClick={handleSubscribe}
                disabled={!selectedPair || subscriptions.includes(selectedPair)}
                className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:bg-muted disabled:cursor-not-allowed"
              >
                Subscribe
              </button>
            </div>
          </div>

          {/* Active Subscriptions */}
          <div className="mb-6">
            <h3 className="mb-3 text-lg font-semibold">Active Subscriptions</h3>
            <div className="flex flex-wrap gap-2">
              {subscriptions.map(symbol => (
                <div 
                  key={symbol} 
                  className="flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-sm font-medium"
                >
                  <span>{symbol}</span>
                  <button 
                    onClick={() => handleUnsubscribe(symbol)}
                    className="ml-1 rounded-full p-1 text-muted-foreground hover:bg-secondary-foreground/10 hover:text-foreground"
                    aria-label={`Unsubscribe from ${symbol}`}
                  >
                    ×
                  </button>
                </div>
              ))}
              {subscriptions.length === 0 && (
                <p className="text-sm text-muted-foreground">No active subscriptions</p>
              )}
            </div>
          </div>

          {/* Latest Signals */}
          <div>
            <h3 className="mb-3 text-lg font-semibold">Latest Signals</h3>
            <div className="space-y-3">
              {signals.map((signal, index) => (
                <div 
                  key={index} 
                  className="rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{signal.symbol}</span>
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                        signal.action === 'BUY' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {signal.action}
                      </span>
                    </div>
                    <span className={`text-sm font-medium ${
                      signal.confidence > 0.7 ? 'text-green-600 dark:text-green-400' : 
                      signal.confidence > 0.5 ? 'text-yellow-600 dark:text-yellow-400' : 
                      'text-red-600 dark:text-red-400'
                    }`}>
                      {(signal.confidence * 100).toFixed(1)}% confidence
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Price</p>
                      <p className="font-medium">${signal.price.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Time</p>
                      <p className="font-medium">{new Date(signal.timestamp).toLocaleString()}</p>
                    </div>
                    {signal.volume && (
                      <div>
                        <p className="text-muted-foreground">Volume</p>
                        <p className="font-medium">${signal.volume.toLocaleString()}</p>
                      </div>
                    )}
                    {signal.trend && (
                      <div>
                        <p className="text-muted-foreground">Trend</p>
                        <p className="font-medium">{signal.trend}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {signals.length === 0 && (
                <div className="rounded-lg border border-dashed p-8 text-center">
                  <p className="text-muted-foreground">No signals received yet</p>
                  <p className="text-sm text-muted-foreground">Subscribe to a trading pair to start receiving signals</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <div className="flex items-center gap-3 rounded-lg border bg-card p-4">
          <div className={`h-3 w-3 rounded-full ${
            status === 'connected' 
              ? 'bg-green-500 shadow-lg shadow-green-500/50' 
              : 'bg-red-500 shadow-lg shadow-red-500/50'
          }`} />
          <span className={`font-medium ${
            status === 'connected' ? 'text-green-600' : 'text-red-600'
          }`}>
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