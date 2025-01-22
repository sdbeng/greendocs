import type { Metadata } from 'next'
import HomePage from '@/components/HomePage'

export const metadata: Metadata = {
  title: 'Introduction | Docs Site',
  description: 'Welcome to our starter documentation site',
}

export default function Home() {
  console.log('hello page.tsx...')
  return <HomePage />
}
