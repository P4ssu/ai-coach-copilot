'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { generateCoachInvite } from '@/app/actions/coach'

export default function InviteCoachPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [generatedLink, setGeneratedLink] = useState('')

  // Check authorization on mount
  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/')
        return
      }

      // Check if user is admin (compare with admin email from env)
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL
      if (adminEmail && user.email === adminEmail) {
        setAuthorized(true)
      } else {
        setError('Unauthorized: Only admins can generate coach invites')
      }

      setLoading(false)
    }

    checkAuth()
  }, [])

  async function handleGenerateInvite(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setGeneratedLink('')
    setSubmitLoading(true)

    if (!email.trim()) {
      setError('Email is required')
      setSubmitLoading(false)
      return
    }

    try {
      const result = await generateCoachInvite(email)

      if (result.success && result.inviteLink) {
        setGeneratedLink(result.inviteLink)
        setSuccess('Invite generated successfully!')
        setEmail('')
      } else {
        setError(result.error || 'Failed to generate invite')
      }
    } catch (err) {
      setError('An error occurred')
    }

    setSubmitLoading(false)
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(generatedLink)
    setSuccess('Link copied to clipboard!')
    setTimeout(() => setSuccess(''), 3000)
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-zinc-400">Checking authorization...</p>
      </div>
    )
  }

  // Unauthorized state
  if (!authorized) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6 text-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
            <p className="text-zinc-400">Only admins can generate coach invites</p>
          </div>
          <Link
            href="/"
            className="inline-block text-emerald-400 hover:text-emerald-300 text-sm font-medium"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Invite Coach</h1>
          <p className="text-zinc-400">Generate a registration link for new coaches</p>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-emerald-900/20 border border-emerald-500/50 rounded-xl p-4">
            <p className="text-emerald-400 text-sm">✓ {success}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleGenerateInvite} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Coach Email *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={submitLoading}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-50"
              placeholder="coach@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={submitLoading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-semibold py-3 rounded-xl transition-colors"
          >
            {submitLoading ? 'Generating...' : 'Generate Invite Link'}
          </button>
        </form>

        {/* Generated Link */}
        {generatedLink && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase text-zinc-500 mb-2">
                Registration Link
              </p>
              <div className="bg-zinc-800/50 rounded-lg p-3 break-all text-sm text-zinc-300">
                {generatedLink}
              </div>
            </div>

            <button
              onClick={copyToClipboard}
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-2 rounded-lg transition-colors"
            >
              Copy Link
            </button>

            <p className="text-xs text-zinc-400 text-center">
              Share this link with the coach. It expires in 7 days.
            </p>
          </div>
        )}

        {/* Back Link */}
        <div className="text-center">
          <Link
            href="/"
            className="text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
