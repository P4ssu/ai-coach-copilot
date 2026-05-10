'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/Header'
import { getCoachProfile, updateCoachProfile } from '@/app/actions/coach'

interface CoachProfile {
  id: string
  name: string
  bio: string | null
  phone: string | null
  email: string
}

export default function CoachProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<CoachProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    phone: '',
  })

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    setLoading(true)
    try {
      const data = await getCoachProfile()
      if (data) {
        setProfile(data)
        setFormData({
          name: data.name,
          bio: data.bio || '',
          phone: data.phone || '',
        })
      }
    } catch (err) {
      console.error('Error loading profile:', err)
      setError('Failed to load profile')
    }
    setLoading(false)
  }

  async function handleSaveProfile() {
    setError('')
    setSaving(true)

    if (!formData.name.trim()) {
      setError('Name is required')
      setSaving(false)
      return
    }

    try {
      const result = await updateCoachProfile({
        name: formData.name,
        bio: formData.bio || undefined,
        phone: formData.phone || undefined,
      })

      if (result.success) {
        setSuccess('Profile updated successfully!')
        setEditing(false)
        await loadProfile()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(result.error || 'Failed to update profile')
      }
    } catch (err) {
      setError('An error occurred')
    }

    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <Header />
        <main className="flex-1 p-8 flex items-center justify-center">
          <p className="text-zinc-400">Loading profile...</p>
        </main>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <Header />
        <main className="flex-1 p-8">
          <div className="max-w-2xl mx-auto">
            <Link
              href="/coach/dashboard"
              className="text-zinc-400 hover:text-white text-sm font-medium mb-6 inline-block transition-colors"
            >
              ← Back to Dashboard
            </Link>
            <p className="text-zinc-400">Profile not found</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />
      <main className="flex-1 p-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Back Button */}
          <Link
            href="/coach/dashboard"
            className="text-zinc-400 hover:text-white text-sm font-medium inline-block transition-colors"
          >
            ← Back to Dashboard
          </Link>

          {/* Profile Header */}
          <div>
            <h1 className="text-4xl font-bold mb-2">Your Profile</h1>
            <p className="text-zinc-400">Manage your coaching information</p>
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-4">
              <p className="text-red-400">{error}</p>
            </div>
          )}
          {success && (
            <div className="bg-emerald-900/20 border border-emerald-500/50 rounded-xl p-4">
              <p className="text-emerald-400">✓ {success}</p>
            </div>
          )}

          {/* Profile Card */}
          <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800">
            {editing ? (
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
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
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Your name"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 resize-none"
                    placeholder="Tell clients about yourself, your experience, and coaching philosophy"
                    rows={5}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-400 opacity-50 cursor-not-allowed"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-semibold py-3 rounded-xl transition-colors"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    disabled={saving}
                    className="flex-1 border border-zinc-700 hover:border-zinc-500 text-zinc-300 font-semibold py-3 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                {/* Display Mode */}
                <div>
                  <p className="text-xs font-semibold uppercase text-zinc-500 mb-2">
                    Name
                  </p>
                  <p className="text-2xl font-bold text-white">{profile.name}</p>
                </div>

                {profile.bio && (
                  <div>
                    <p className="text-xs font-semibold uppercase text-zinc-500 mb-2">
                      Bio
                    </p>
                    <p className="text-zinc-300 whitespace-pre-wrap">{profile.bio}</p>
                  </div>
                )}

                {profile.phone && (
                  <div>
                    <p className="text-xs font-semibold uppercase text-zinc-500 mb-2">
                      Phone
                    </p>
                    <p className="text-zinc-300">{profile.phone}</p>
                  </div>
                )}

                <div>
                  <p className="text-xs font-semibold uppercase text-zinc-500 mb-2">
                    Email
                  </p>
                  <p className="text-zinc-300">{profile.email}</p>
                </div>

                {/* Edit Button */}
                <button
                  onClick={() => setEditing(true)}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold py-3 rounded-xl transition-colors"
                >
                  Edit Profile
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
