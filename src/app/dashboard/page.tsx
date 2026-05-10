import { Suspense } from 'react'
import { DashboardClient } from './DashboardClient'

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center"><p className="text-zinc-400">Loading...</p></div>}>
      <DashboardClient />
    </Suspense>
  )
}
