'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/Header'
import { createClient } from '@/lib/supabase/client'
import { deleteClient, requestClientEmailChange } from '@/app/actions/coach'
import { Client, ClientInvite } from '@/types/coach'
import { CheckInRecord } from '@/types/checkin'

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const clientId = params.id as string

  const [client, setClient] = useState<Client | null>(null)
  const [checkIns, setCheckIns] = useState<CheckInRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showEmailChangeModal, setShowEmailChangeModal] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [emailChanging, setEmailChanging] = useState(false)
  const [emailChangeMessage, setEmailChangeMessage] = useState('')

  const [editData, setEditData] = useState({
    name: '',
    phone: '',
  })

  const supabase = createClient()

  useEffect(() => {
    loadClientData()
  }, [clientId])

  async function loadClientData() {
    setLoading(true)
    try {
      // Get client info
      const { data: clientData } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single()

      if (clientData) {
        setClient(clientData)
        setEditData({
          name: clientData.name || '',
          phone: clientData.phone || '',
        })

        // Get client's check-ins
        const { data: checkInData } = await supabase
          .from('checkins')
          .select('*')
          .eq('client_id', clientId)
          .order('created_at', { ascending: false })

        if (checkInData) {
          setCheckIns(checkInData)
        }
      }
    } catch (err) {
      console.error('Error loading client:', err)
    }
    setLoading(false)
  }

  async function handleSaveEdit() {
    if (!client) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('clients')
        .update({
          name: editData.name || null,
          phone: editData.phone || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', clientId)

      if (!error) {
        setClient({
          ...client,
          name: editData.name || null,
          phone: editData.phone || null,
        })
        setEditing(false)
      }
    } catch (err) {
      console.error('Error saving client:', err)
    }
    setSaving(false)
  }

  async function handleDeleteClient() {
    setDeleting(true)
    try {
      const result = await deleteClient(clientId)
      if (result.success) {
        router.push('/coach/clients')
      }
    } catch (err) {
      console.error('Error deleting client:', err)
    }
    setDeleting(false)
  }

  async function handleRequestEmailChange() {
    if (!newEmail.trim()) {
      setEmailChangeMessage('Please enter a valid email address')
      return
    }

    setEmailChanging(true)
    setEmailChangeMessage('')

    try {
      const result = await requestClientEmailChange(clientId, newEmail)
      if (result.success) {
        const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        const message = isDevelopment
          ? 'Ready for verification! Check browser console for the verification link (Dev Mode).'
          : 'Verification email sent! The client will receive an email to confirm the change.'
        setEmailChangeMessage(message)
        setNewEmail('')
        setTimeout(() => {
          setShowEmailChangeModal(false)
          setEmailChangeMessage('')
        }, isDevelopment ? 3000 : 2000)
      } else {
        setEmailChangeMessage(result.error || 'Failed to send verification email')
      }
    } catch (err) {
      setEmailChangeMessage('An error occurred')
      console.error('Error changing email:', err)
    }

    setEmailChanging(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <Header />
        <main className="flex-1 p-8 flex items-center justify-center">
          <p className="text-zinc-400">Loading client...</p>
        </main>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <Header />
        <main className="flex-1 p-8">
          <div className="max-w-3xl mx-auto">
            <Link
              href="/coach/clients"
              className="text-zinc-400 hover:text-white text-sm mb-6 inline-block"
            >
              ← Back to Clients
            </Link>
            <p className="text-zinc-400">Client not found</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />
      <main className="flex-1 p-8">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Back Button */}
          <Link
            href="/coach/clients"
            className="text-zinc-400 hover:text-white text-sm font-medium inline-block transition-colors"
          >
            ← Back to Clients
          </Link>

          {/* Client Info Card */}
          <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {client.name || client.email}
                </h1>
                <p className="text-zinc-400">{client.email}</p>
              </div>
              {!editing && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditing(true)}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setShowEmailChangeModal(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    Change Email
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>

            {editing ? (
              <div className="space-y-4 pt-6 border-t border-zinc-800">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) =>
                      setEditData({ ...editData, name: e.target.value })
                    }
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Client name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={editData.phone}
                    onChange={(e) =>
                      setEditData({ ...editData, phone: e.target.value })
                    }
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Phone number"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSaveEdit}
                    disabled={saving}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-semibold py-2 rounded-lg transition-colors"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="flex-1 border border-zinc-700 hover:border-zinc-500 text-zinc-300 font-semibold py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 pt-6 border-t border-zinc-800">
                {client.phone && (
                  <div>
                    <p className="text-xs font-semibold uppercase text-zinc-500 mb-1">
                      Phone
                    </p>
                    <p className="text-white">{client.phone}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold uppercase text-zinc-500 mb-1">
                    Status
                  </p>
                  <p className="text-emerald-400 capitalize">{client.status}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-zinc-500 mb-1">
                    Member Since
                  </p>
                  <p className="text-white">
                    {new Date(client.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Check-Ins Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Check-Ins ({checkIns.length})</h2>

            {checkIns.length === 0 ? (
              <div className="bg-zinc-900 rounded-2xl p-8 text-center border border-zinc-800 border-dashed">
                <p className="text-zinc-400">No check-ins yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {checkIns.map((checkIn) => (
                  <Link
                    key={checkIn.id}
                    href={`/coach/review/${checkIn.id}`}
                    className="block bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl p-4 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-zinc-500 mb-2">
                          {new Date(checkIn.created_at).toLocaleDateString(
                            'en-US',
                            {
                              weekday: 'long',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )}
                        </p>
                        <p className="text-white font-medium mb-2">
                          {checkIn.weight} kg • Intensity {checkIn.workout_intensity}/10 •
                          Sleep {checkIn.sleep_hours}h
                        </p>
                        <div className="flex items-center gap-2">
                          {checkIn.status === 'pending_review' && (
                            <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded">
                              Pending
                            </span>
                          )}
                          {checkIn.status === 'approved' && (
                            <span className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded">
                              Reviewed
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-emerald-400">→</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Delete Confirmation Dialog */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-sm w-full space-y-4">
                <h2 className="text-xl font-bold text-white">Delete Client?</h2>
                <p className="text-zinc-400">
                  This will permanently delete this client and remove their access to the platform.
                </p>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleDeleteClient}
                    disabled={deleting}
                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-2 rounded-lg transition-colors"
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleting}
                    className="flex-1 border border-zinc-700 hover:border-zinc-500 text-zinc-300 font-semibold py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Email Change Modal */}
          {showEmailChangeModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-sm w-full space-y-4">
                <h2 className="text-xl font-bold text-white">Change Client Email</h2>
                <p className="text-zinc-400 text-sm">
                  A verification email will be sent to the new address. The client must confirm the change.
                </p>

                {emailChangeMessage && (
                  <div
                    className={`p-3 rounded-lg text-sm ${
                      emailChangeMessage.includes('success') || emailChangeMessage.includes('sent')
                        ? 'bg-emerald-900/30 border border-emerald-500/50 text-emerald-400'
                        : 'bg-red-900/30 border border-red-500/50 text-red-400'
                    }`}
                  >
                    {emailChangeMessage}
                  </div>
                )}

                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="new.email@example.com"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                  disabled={emailChanging}
                />

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleRequestEmailChange}
                    disabled={emailChanging || !newEmail.trim()}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2 rounded-lg transition-colors"
                  >
                    {emailChanging ? 'Sending...' : 'Send Verification'}
                  </button>
                  <button
                    onClick={() => {
                      setShowEmailChangeModal(false)
                      setNewEmail('')
                      setEmailChangeMessage('')
                    }}
                    disabled={emailChanging}
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
