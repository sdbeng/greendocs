'use client';

import { useState, useEffect, useCallback } from 'react'

// interface WebSocketMessage {
//   type: string
//   payload: unknown
// }

interface TradeSignal {
  symbol: string
  action: 'BUY' | 'SELL'
  price: number
  confidence: number
  timestamp: number
}

interface SubscriptionResponse {
  symbols: string[]
  total?: number
}

// Update the WebSocketMessage type to be more specific
interface WebSocketResponse {
  type: 'signal' | 'subscribed' | 'unsubscribed' | 'error'
  payload: TradeSignal | SubscriptionResponse | string
}

export function useWebSocket() {
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [status, setStatus] = useState('disconnected')
  const [signals, setSignals] = useState<TradeSignal[]>([])
  const [subscriptions, setSubscriptions] = useState<string[]>([])

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080')

    ws.onopen = () => {
      setStatus('connected')
      setSocket(ws)
    }

    ws.onclose = () => {
      setStatus('disconnected')
      setSocket(null)
    }

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data) as WebSocketResponse
      
      switch (message.type) {
        case 'signal':
          if (isTradeSignal(message.payload)) {
            setSignals(prev => [...prev, message.payload])
          }
          break
        case 'subscribed':
        case 'unsubscribed':
          if (isSubscriptionResponse(message.payload)) {
            const { symbols } = message.payload
            setSubscriptions(prev => 
              message.type === 'subscribed'
                ? [...new Set([...prev, ...symbols])]
                : prev.filter(s => !symbols.includes(s))
            )
          }
          break
      }
    }

    return () => {
      ws.close()
    }
  }, [])

  // Type guard functions
  function isTradeSignal(payload: unknown): payload is TradeSignal {
    return (
      typeof payload === 'object' &&
      payload !== null &&
      'symbol' in payload &&
      'action' in payload &&
      'price' in payload &&
      'confidence' in payload &&
      'timestamp' in payload
    )
  }

  function isSubscriptionResponse(payload: unknown): payload is SubscriptionResponse {
    return (
      typeof payload === 'object' &&
      payload !== null &&
      'symbols' in payload &&
      Array.isArray((payload as SubscriptionResponse).symbols)
    )
  }

  const subscribe = useCallback((symbols: string[]) => {
    if (socket) {
      socket.send(JSON.stringify({
        type: 'subscribe',
        payload: { symbols }
      }))
    }
  }, [socket])

  const unsubscribe = useCallback((symbols: string[]) => {
    if (socket) {
      socket.send(JSON.stringify({
        type: 'unsubscribe',
        payload: { symbols }
      }))
    }
  }, [socket])

  return {
    status,
    signals,
    subscriptions,
    subscribe,
    unsubscribe
  }
}

export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080'; 