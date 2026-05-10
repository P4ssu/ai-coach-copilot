'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/Header'
import {
  getCoachClientsWithInvites,
  createClientAndSendInvite,
  resendClientInvite,
  deleteClientInvite,
  deleteClient,
} from '@/app/actions/coach'
import { Client, ClientInvite } from '@/types/coach'

export default function CoachClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [invites, setInvites] = useState<ClientInvite[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddClient, setShowAddClient] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [deleteConfirmType, setDeleteConfirmType] = useState<'invite' | 'client' | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: '',
  })

  useEffect(() => {
    loadClientsAndInvites()
  }, [])

  async function loadClientsAndInvites() {
    setLoading(true)
    try {
      const data = await getCoachClientsWithInvites()
      setClients(data.clients)
      setInvites(data.invites)
    } catch (err) {
      setError('Failed to load clients')
    }
    setLoading(false)
  }

  async function handleAddClient(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.name.trim()) {
      setError('Name is required')
      return
    }

    setSubmitting(true)

    try {
      const result = await createClientAndSendInvite({
        email: formData.email,
        name: formData.name,
        phone: formData.phone || undefined,
      })

      if (result.success) {
        setSuccess('Invite sent successfully!')
        setFormData({ email: '', name: '', phone: '' })
        setShowAddClient(false)
        await loadClientsAndInvites()
      } else {
        setError(result.error || 'Failed to create client')
      }
    } catch (err) {
      setError('An error occurred')
    }

    setSubmitting(false)
  }

  async function handleResendInvite(inviteId: string) {
    try {
      const result = await resendClientInvite(inviteId)
      if (result.success) {
        setSuccess('Invite resent!')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(result.error || 'Failed to resend invite')
      }
    } catch (err) {
      setError('An error occurred')
    }
  }

  async function handleDeleteInvite() {
    if (!deleteConfirmId) return
    setDeleting(true)

    try {
      const result = await deleteClientInvite(deleteConfirmId)
      if (result.success) {
        setSuccess('Invite deleted')
        setDeleteConfirmId(null)
        setDeleteConfirmType(null)
        setTimeout(() => setSuccess(''), 3000)
        await loadClientsAndInvites()
      } else {
        setError(result.error || 'Failed to delete invite')
      }
    } catch (err) {
      setError('An error occurred')
    }

    setDeleting(false)
  }

  async function handleDeleteClient() {
    if (!deleteConfirmId) return
    setDeleting(true)

    try {
      const result = await deleteClient(deleteConfirmId)
      if (result.success) {
        setSuccess('Client deleted')
        setDeleteConfirmId(null)
        setDeleteConfirmType(null)
        setTimeout(() => setSuccess(''), 3000)
        await loadClientsAndInvites()
      } else {
        setError(result.error || 'Failed to delete client')
      }
    } catch (err) {
      setError('An error occurred')
    }

    setDeleting(false)
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />
      <main className="flex-1 p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/coach/dashboard"
                className="text-zinc-400 hover:text-white text-lg transition-colors"
              >
                ←
              </Link>
              <div>
                <h1 className="text-4xl font-bold mb-2">Manage Clients</h1>
                <p className="text-zinc-400">Add and manage your coaching clients</p>
              </div>
            </div>
            {!showAddClient && (
              <button
                onClick={() => setShowAddClient(true)}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-6 py-3 rounded-xl transition-colors"
              >
                + Add Client
              </button>
            )}
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

          {/* Add Client Form */}
          {showAddClient && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Add New Client</h2>
                <button
                  onClick={() => setShowAddClient(false)}
                  className="text-zinc-500 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddClient} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="client@example.com"
                  />
                </div>

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
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="John Doe"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-semibold py-2 rounded-xl transition-colors"
                  >
                    {submitting ? 'Sending...' : 'Send Invite'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddClient(false)}
                    className="flex-1 border border-zinc-700 hover:border-zinc-500 text-zinc-300 font-semibold py-2 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-emerald-900/30 to-emerald-900/10 border border-emerald-500/30 rounded-2xl p-6">
              <p className="text-emerald-400 text-sm font-semibold uppercase mb-2">
                Active Clients
              </p>
              <p className="text-4xl font-bold text-white">{clients.length}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-900/30 to-purple-900/10 border border-purple-500/30 rounded-2xl p-6">
              <p className="text-purple-400 text-sm font-semibold uppercase mb-2">
                Pending Invites
              </p>
              <p className="text-4xl font-bold text-white">
                {invites.filter((i) => i.status === 'pending').length}
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-900/30 to-blue-900/10 border border-blue-500/30 rounded-2xl p-6">
              <p className="text-blue-400 text-sm font-semibold uppercase mb-2">
                Total Invites
              </p>
              <p className="text-4xl font-bold text-white">{invites.length}</p>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center text-zinc-400">
              <p>Loading clients...</p>
            </div>
          )}

          {/* Pending Invites Section */}
          {!loading && invites.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white mb-4">
                Pending Invites
              </h2>
              <div className="space-y-3">
                {invites
                  .filter((i) => i.status === 'pending')
                  .map((invite) => (
                    <div
                      key={invite.id}
                      className="bg-zinc-900/50 border border-purple-500/30 rounded-xl p-4 flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <p className="text-white font-medium">{invite.email}</p>
                        <p className="text-xs text-zinc-400">
                          Invited on{' '}
                          {new Date(invite.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded">
                          Pending
                        </span>
                        <button
                          onClick={() => handleResendInvite(invite.id)}
                          className="text-xs px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded transition-colors"
                        >
                          Resend
                        </button>
                        <button
                          onClick={() => {
                            setDeleteConfirmId(invite.id)
                            setDeleteConfirmType('invite')
                          }}
                          className="text-xs px-3 py-1 bg-red-900/20 hover:bg-red-900/30 text-red-400 rounded transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Active Clients Section */}
          {!loading && clients.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white mb-4">
                Active Clients
              </h2>
              <div className="space-y-3">
                {clients.map((client) => (
                  <div
                    key={client.id}
                    className="bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 rounded-xl p-4 flex items-center justify-between transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-white font-medium">
                        {client.name || client.email}
                      </p>
                      <div className="flex gap-3 mt-1 text-xs text-zinc-400">
                        <span>{client.email}</span>
                        {client.phone && <span>{client.phone}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded">
                        Active
                      </span>
                      <Link
                        href={`/coach/clients/${client.id}`}
                        className="text-xs px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded transition-colors"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => {
                          setDeleteConfirmId(client.id)
                          setDeleteConfirmType('client')
                        }}
                        className="text-xs px-3 py-1 bg-red-900/20 hover:bg-red-900/30 text-red-400 rounded transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && clients.length === 0 && invites.length === 0 && (
            <div className="bg-zinc-900 rounded-2xl p-12 text-center border border-zinc-800 border-dashed">
              <p className="text-zinc-400 mb-4">No clients yet</p>
              <button
                onClick={() => setShowAddClient(true)}
                className="inline-block bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-6 py-2 rounded-xl transition-colors"
              >
                Add Your First Client
              </button>
            </div>
          )}

          {/* Delete Confirmation Dialog */}
          {deleteConfirmId && deleteConfirmType && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-sm w-full space-y-4">
                <h2 className="text-xl font-bold text-white">
                  {deleteConfirmType === 'invite' ? 'Delete Invite?' : 'Delete Client?'}
                </h2>
                <p className="text-zinc-400">
                  {deleteConfirmType === 'invite'
                    ? 'This will permanently delete the invitation. The invite link will no longer work.'
                    : 'This will permanently delete the client and remove their access to the platform.'}
                </p>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={
                      deleteConfirmType === 'invite' ? handleDeleteInvite : handleDeleteClient
                    }
                    disabled={deleting}
                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-2 rounded-lg transition-colors"
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                  <button
                    onClick={() => {
                      setDeleteConfirmId(null)
                      setDeleteConfirmType(null)
                    }}
                    className="flex-1 border border-zinc-700 hover:border-zinc-500 text-zinc-300 font-semibold py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
