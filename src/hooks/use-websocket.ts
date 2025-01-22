'use client';

import { useState, useEffect, useCallback } from 'react'

interface TradeSignal {
  symbol: string
  action: 'BUY' | 'SELL'
  price: number
  confidence: number
  timestamp: number
  volume?: number    // Optional volume
  trend?: string     // Optional trend
}

interface SubscriptionResponse {
  symbols: string[]
  total?: number
}

// Make the response type more specific
type WebSocketResponse = 
  | { type: 'signal'; payload: TradeSignal }
  | { type: 'subscribed'; payload: SubscriptionResponse }
  | { type: 'unsubscribed'; payload: SubscriptionResponse }
  | { type: 'error'; payload: string }

interface WebSocketState {
  status: 'connected' | 'disconnected' | 'connecting'
  signals: TradeSignal[]
  subscriptions: string[]
  error: string | null
  isLoading: boolean
}

export function useWebSocket() {
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [state, setState] = useState<WebSocketState>({
    status: 'connecting',
    signals: [],
    subscriptions: [],
    error: null,
    isLoading: false
  })

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080')

    ws.onopen = () => {
      setState(prev => ({ ...prev, status: 'connected', error: null }))
      setSocket(ws)
    }

    ws.onclose = () => {
      setState(prev => ({ 
        ...prev, 
        status: 'disconnected',
        error: 'Connection lost. Attempting to reconnect...'
      }))
      setSocket(null)
    }

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data) as WebSocketResponse
      
      switch (message.type) {
        case 'signal':
          setState(prev => ({
            ...prev,
            signals: [...prev.signals, message.payload]
          }))
          break
          
        case 'subscribed':
          setState(prev => ({
            ...prev,
            subscriptions: [...new Set([...prev.subscriptions, ...message.payload.symbols])]
          }))
          break
          
        case 'unsubscribed':
          setState(prev => ({
            ...prev,
            subscriptions: prev.subscriptions.filter(s => !message.payload.symbols.includes(s))
          }))
          break
          
        case 'error':
          setState(prev => ({
            ...prev,
            error: message.payload
          }))
          break
      }
    }

    ws.onerror = (event) => {
      setState(prev => ({ 
        ...prev, 
        error: 'WebSocket error occurred. Please try again later.'
      }))
      console.error('WebSocket error:', event)
    }

    return () => {
      ws.close()
    }
  }, [])

  const subscribe = useCallback((symbols: string[]) => {
    if (socket?.readyState === WebSocket.OPEN) {
      setState(prev => ({ ...prev, isLoading: true }))
      socket.send(JSON.stringify({
        type: 'subscribe',
        payload: { symbols }
      }))
    } else {
      setState(prev => ({
        ...prev,
        error: 'Cannot subscribe: WebSocket is not connected'
      }))
    }
  }, [socket])

  const unsubscribe = useCallback((symbols: string[]) => {
    if (socket?.readyState === WebSocket.OPEN) {
      setState(prev => ({ ...prev, isLoading: true }))
      socket.send(JSON.stringify({
        type: 'unsubscribe',
        payload: { symbols }
      }))
    }
  }, [socket])

  return {
    status: state.status,
    signals: state.signals,
    subscriptions: state.subscriptions,
    error: state.error,
    isLoading: state.isLoading,
    subscribe,
    unsubscribe
  }
}

export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080'; 