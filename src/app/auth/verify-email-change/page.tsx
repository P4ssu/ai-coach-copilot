import { Suspense } from 'react'
import { VerifyEmailClient } from './VerifyEmailClient'

export default function VerifyEmailChangePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center"><p className="text-zinc-400">Loading...</p></div>}>
      <VerifyEmailClient />
    </Suspense>
  )
}
