'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { validateCoachInvite, acceptCoachInviteAndCreateAccount } from '@/app/actions/coach'
import Link from 'next/link'

export default function RegisterCoachPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [error, setError] = useState('')
  const [inviteToken, setInviteToken] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteValid, setInviteValid] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const supabase = createClient()

  // Validate invite on mount
  useEffect(() => {
    async function validateInvite() {
      const token = searchParams.get('token')
      const email = searchParams.get('email')

      if (!token || !email) {
        setError('Invalid invite link. Please check your email.')
        setLoading(false)
        return
      }

      try {
        const result = await validateCoachInvite(token, email)

        if (result.success) {
          setInviteToken(token)
          setInviteEmail(email)
          setFormData({ ...formData, email: email })
          setInviteValid(true)
        } else {
          setError(result.error || 'Invalid invite link.')
        }
      } catch (err) {
        setError('Failed to validate invite.')
      }

      setLoading(false)
    }

    validateInvite()
  }, [searchParams])

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setRegistering(true)

    // Validate name
    if (!formData.name.trim()) {
      setError('Name is required')
      setRegistering(false)
      return
    }

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setRegistering(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      setRegistering(false)
      return
    }

    try {
      // Register with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            name: formData.name,
          },
        },
      })

      if (authError) {
        setError(authError.message)
        setRegistering(false)
        return
      }

      if (!authData.user) {
        setError('Registration failed. Please try again.')
        setRegistering(false)
        return
      }

      // Accept invite and create coach profile
      const acceptResult = await acceptCoachInviteAndCreateAccount(
        inviteToken,
        inviteEmail,
        authData.user.id
      )

      if (!acceptResult.success) {
        setError(acceptResult.error || 'Failed to complete registration')
        setRegistering(false)
        return
      }

      // Success! Redirect to coach profile to complete setup
      router.push('/coach/profile')
    } catch (err) {
      setError('An error occurred during registration')
      console.error(err)
      setRegistering(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400">Validating invite...</p>
        </div>
      </div>
    )
  }

  // Invalid invite
  if (!inviteValid) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6 text-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Invalid Invite</h1>
            <p className="text-zinc-400">{error}</p>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-zinc-400">
              If you believe this is a mistake, contact support.
            </p>
            <Link
              href="/"
              className="inline-block text-emerald-400 hover:text-emerald-300 text-sm font-medium"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Registration form
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Become a Coach</h1>
          <p className="text-zinc-400">Create your coaching account</p>
        </div>

        {/* Invite Info */}
        <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-xl p-4">
          <p className="text-sm text-emerald-400">
            ✓ Invite valid for <strong>{inviteEmail}</strong>
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="Your name"
            />
          </div>

          {/* Email (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-white opacity-50 cursor-not-allowed"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
              minLength={6}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="At least 6 characters"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              required
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="Confirm your password"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={registering}
            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-semibold py-3 rounded-xl transition-colors mt-6"
          >
            {registering ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

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
