'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { verifyClientEmailChange } from '@/app/actions/coach'
import Link from 'next/link'

interface VerifyEmailClientProps {
  token: string | null
}

export function VerifyEmailClient({ token }: VerifyEmailClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [newEmail, setNewEmail] = useState('')

  useEffect(() => {
    async function verifyEmail() {
      if (!token) {
        setError('Invalid verification link')
        setLoading(false)
        return
      }

      try {
        const result = await verifyClientEmailChange(token)

        if (result.success) {
          setSuccess(true)
          setNewEmail(result.newEmail || '')
          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            router.push('/dashboard')
          }, 3000)
        } else {
          setError(result.error || 'Failed to verify email change')
        }
      } catch (err) {
        setError('An error occurred during verification')
        console.error(err)
      }

      setLoading(false)
    }

    verifyEmail()
  }, [token, router])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400">Verifying your email...</p>
        </div>
      </div>
    )
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6 text-center">
          <div>
            <div className="w-16 h-16 bg-emerald-900/30 border border-emerald-500/50 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-emerald-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-2">Email Verified!</h1>
            <p className="text-zinc-400">Your email has been successfully changed to:</p>
            <p className="text-emerald-400 font-medium mt-2">{newEmail}</p>
          </div>

          <p className="text-sm text-zinc-400">
            You'll be redirected to your dashboard shortly...
          </p>

          <Link
            href="/dashboard"
            className="inline-block text-emerald-400 hover:text-emerald-300 text-sm font-medium"
          >
            Go to Dashboard Now →
          </Link>
        </div>
      </div>
    )
  }

  // Error state
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Email Verification Failed</h1>
          <p className="text-zinc-400">{error}</p>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-zinc-400">
            If the link has expired, your coach can send you a new verification link.
          </p>
          <Link
            href="/dashboard"
            className="inline-block text-emerald-400 hover:text-emerald-300 text-sm font-medium"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
