import { useState, useEffect } from 'react'

interface WebSocketState {
  status: 'connected' | 'disconnected'
  sendMessage: (message: unknown) => void
}

export function useWebSocket(): WebSocketState {
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [status, setStatus] = useState<'connected' | 'disconnected'>('disconnected')

  useEffect(() => {
    const wsInstance = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080')

    wsInstance.onopen = () => {
      setStatus('connected')
    }

    wsInstance.onclose = () => {
      setStatus('disconnected')
    }

    wsInstance.onerror = () => {
      setStatus('disconnected')
    }

    setWs(wsInstance)

    return () => {
      wsInstance.close()
    }
  }, [])

  const sendMessage = (message: unknown) => {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message))
    }
  }

  return { status, sendMessage }
}

export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080'; 