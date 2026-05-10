'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/Header'
import { createClient } from '@/lib/supabase/client'
import { getClientInfo } from '@/app/actions/client'
import { CheckInRecord } from '@/types/checkin'

type CheckInData = CheckInRecord

interface ClientData {
  email: string
  name: string | null
}

export default function ReviewPage() {
  const router = useRouter()
  const params = useParams()
  const checkInId = params.id as string

  const [checkIn, setCheckIn] = useState<CheckInData | null>(null)
  const [client, setClient] = useState<ClientData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Editable fields
  const [coachResponse, setCoachResponse] = useState('')
  const [progressSummary, setProgressSummary] = useState('')
  const [recoveryStatus, setRecoveryStatus] = useState('')
  const [nutritionAnalysis, setNutritionAnalysis] = useState('')
  const [suggestedAdjustments, setSuggestedAdjustments] = useState('')

  const supabase = createClient()

  useEffect(() => {
    async function loadCheckIn() {
      const { data, error } = await supabase
        .from('checkins')
        .select('*')
        .eq('id', checkInId)
        .single()

      if (data && !error) {
        setCheckIn(data)
        setCoachResponse(data.analysis.coachResponse)
        setProgressSummary(data.analysis.progressSummary)
        setRecoveryStatus(data.analysis.recoveryStatus)
        setNutritionAnalysis(data.analysis.nutritionAnalysis)
        setSuggestedAdjustments(data.analysis.suggestedAdjustments)

        // Fetch client data via server action
        const clientData = await getClientInfo(data.user_id)
        if (clientData) {
          setClient(clientData)
        }
      }
      setLoading(false)
    }

    loadCheckIn()
  }, [checkInId])

  async function handleApprove() {
    setSubmitting(true)

    const updatedAnalysis = {
      progressSummary,
      recoveryStatus,
      nutritionAnalysis,
      suggestedAdjustments,
      coachResponse,
    }

    const { error } = await supabase
      .from('checkins')
      .update({
        status: 'approved',
        analysis: updatedAnalysis,
        coach_notes: JSON.stringify(updatedAnalysis),
        coach_reviewed_at: new Date().toISOString(),
      })
      .eq('id', checkInId)

    if (!error) {
      router.push('/coach/dashboard')
    }
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <Header />
        <main className="flex-1 p-8 flex items-center justify-center">
          <p className="text-zinc-400">Loading...</p>
        </main>
      </div>
    )
  }

  if (!checkIn) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <Header />
        <main className="flex-1 p-8 flex items-center justify-center">
          <p className="text-zinc-400">Check-in not found</p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />
      <main className="flex-1 p-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/coach/dashboard"
              className="text-zinc-400 hover:text-white text-sm font-medium mb-4 inline-block transition-colors"
            >
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold mb-4">Review & Approve</h1>
            <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-500 mb-2">Client</p>
                  <p className="text-xl font-bold text-white">{client?.name || client?.email || 'Loading...'}</p>
                  {client?.name && client?.email && (
                    <p className="text-sm text-zinc-400">{client.email}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-zinc-500 mb-2">Check-in Date</p>
                  <p className="text-lg font-bold text-emerald-400">
                    {new Date(checkIn.created_at).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {new Date(checkIn.created_at).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Client Data Summary */}
          <div className="bg-zinc-900 rounded-2xl p-6 mb-8 border border-zinc-800">
            <p className="text-sm font-semibold uppercase text-zinc-500 mb-4">Check-In Data</p>
            <div className="grid grid-cols-4 gap-4 text-center mb-6">
              <div>
                <p className="text-zinc-500 text-xs">Weight</p>
                <p className="text-lg font-bold text-emerald-400">{checkIn.weight} kg</p>
              </div>
              <div>
                <p className="text-zinc-500 text-xs">Intensity</p>
                <p className="text-lg font-bold text-emerald-400">{checkIn.workout_intensity}/10</p>
              </div>
              <div>
                <p className="text-zinc-500 text-xs">Sleep</p>
                <p className="text-lg font-bold text-blue-400">{checkIn.sleep_hours}h</p>
              </div>
              <div>
                <p className="text-zinc-500 text-xs">Nutrition</p>
                <p className="text-lg font-bold text-emerald-400">{checkIn.nutrition_adherence}/10</p>
              </div>
            </div>
            {checkIn.notes && (
              <div>
                <p className="text-xs font-semibold uppercase text-zinc-500 mb-2">Notes</p>
                <p className="text-zinc-300 text-sm">{checkIn.notes}</p>
              </div>
            )}
            {checkIn.nutrition_notes && (
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase text-zinc-500 mb-2">Nutrition Notes</p>
                <p className="text-zinc-300 text-sm">{checkIn.nutrition_notes}</p>
              </div>
            )}
          </div>

          {/* Edit Fields */}
          <form className="space-y-6">
            {/* Coach Message */}
            <div className="bg-emerald-900/10 border border-emerald-700/30 rounded-2xl p-6 space-y-3">
              <div>
                <label className="block text-base font-bold text-emerald-400 mb-1">Coach Message</label>
                <p className="text-xs text-zinc-400">Main message to motivate the client</p>
              </div>
              <textarea
                value={coachResponse}
                onChange={(e) => setCoachResponse(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-4 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                rows={5}
              />
            </div>

            {/* Progress Summary */}
            <div className="bg-blue-900/10 border border-blue-700/30 rounded-2xl p-6 space-y-3">
              <label className="block text-base font-bold text-blue-400">Progress Summary</label>
              <textarea
                value={progressSummary}
                onChange={(e) => setProgressSummary(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-4 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                rows={4}
              />
            </div>

            {/* Recovery Status */}
            <div className="bg-purple-900/10 border border-purple-700/30 rounded-2xl p-6 space-y-3">
              <label className="block text-base font-bold text-purple-400">Recovery Status</label>
              <textarea
                value={recoveryStatus}
                onChange={(e) => setRecoveryStatus(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-4 text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                rows={4}
              />
            </div>

            {/* Nutrition Analysis */}
            <div className="bg-orange-900/10 border border-orange-700/30 rounded-2xl p-6 space-y-3">
              <label className="block text-base font-bold text-orange-400">Nutrition Analysis</label>
              <textarea
                value={nutritionAnalysis}
                onChange={(e) => setNutritionAnalysis(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-4 text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500 transition-colors resize-none"
                rows={4}
              />
            </div>

            {/* Suggested Adjustments */}
            <div className="bg-cyan-900/10 border border-cyan-700/30 rounded-2xl p-6 space-y-3">
              <label className="block text-base font-bold text-cyan-400">Suggested Adjustments</label>
              <textarea
                value={suggestedAdjustments}
                onChange={(e) => setSuggestedAdjustments(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-4 text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                rows={5}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={handleApprove}
                disabled={submitting}
                className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-semibold py-3 rounded-xl transition-colors"
              >
                {submitting ? 'Sending...' : 'Approve & Send to Client'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 border border-zinc-700 hover:border-zinc-500 text-zinc-300 font-semibold py-3 rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
