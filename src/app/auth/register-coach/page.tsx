import { Suspense } from 'react'
import { RegisterCoachClient } from './RegisterCoachClient'

export default function RegisterCoachPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center"><p className="text-zinc-400">Loading...</p></div>}>
      <RegisterCoachClient />
    </Suspense>
  )
}
