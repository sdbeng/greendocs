import type { Metadata } from 'next'
import HomePage from '@/components/HomePage'

export const metadata: Metadata = {
  title: 'Real Time Trading | Docs Site',
  description: 'Welcome to our Real time Trading and Signals documentation site',
}

export default function Home() {
  return <HomePage />
}
