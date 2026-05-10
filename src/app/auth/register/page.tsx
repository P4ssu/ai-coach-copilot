import { Suspense } from 'react'
import { RegisterClient } from './RegisterClient'

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center"><p className="text-zinc-400">Loading...</p></div>}>
      <RegisterClient />
    </Suspense>
  )
}
