'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/Header'
import { createClient } from '@/lib/supabase/client'

interface PendingReview {
  id: string
  weight: number
  workout_intensity: number
  sleep_hours: number
  nutrition_adherence: number
  notes: string
  created_at: string
  analysis: {
    coachResponse: string
    progressSummary: string
    recoveryStatus: string
    nutritionAnalysis: string
    suggestedAdjustments: string
  }
}

export default function CoachDashboard() {
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadPendingReviews() {
      const { data, error } = await supabase
        .from('checkins')
        .select('*')
        .eq('status', 'pending_review')
        .order('created_at', { ascending: false })

      if (data && !error) {
        setPendingReviews(data)
      }
      setLoading(false)
    }

    loadPendingReviews()
  }, [])

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">Coaching Dashboard</h1>
                <p className="text-zinc-400">Manage client check-ins and provide personalized feedback</p>
              </div>
              <Link
                href="/coach/clients"
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-6 py-3 rounded-xl transition-colors"
              >
                Manage Clients
              </Link>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 gap-4">
              {/* Pending Reviews */}
              <div className="bg-gradient-to-br from-purple-900/30 to-purple-900/10 border border-purple-500/30 rounded-2xl p-6">
                <p className="text-purple-400 text-sm font-semibold uppercase mb-2">Pending Reviews</p>
                <p className="text-4xl font-bold text-white">{pendingReviews.length}</p>
                <p className="text-xs text-purple-300 mt-2">Awaiting your feedback</p>
              </div>

              {/* Total Reviewed */}
              <div className="bg-gradient-to-br from-emerald-900/30 to-emerald-900/10 border border-emerald-500/30 rounded-2xl p-6">
                <p className="text-emerald-400 text-sm font-semibold uppercase mb-2">All Reviews</p>
                <p className="text-4xl font-bold text-white">{pendingReviews.length}</p>
                <p className="text-xs text-emerald-300 mt-2">In this session</p>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center text-zinc-400">Loading...</div>
          )}

          {/* No Pending Reviews */}
          {!loading && pendingReviews.length === 0 && (
            <div className="bg-gradient-to-br from-emerald-900/20 to-emerald-900/5 rounded-2xl p-12 text-center border border-emerald-500/20 border-dashed">
              <div className="mb-4 text-4xl">✓</div>
              <h2 className="text-2xl font-bold mb-2 text-emerald-400">All Caught Up!</h2>
              <p className="text-zinc-400">No pending client check-ins awaiting review. Your clients will appear here when they submit new data.</p>
            </div>
          )}

          {/* Reviews Header */}
          {!loading && pendingReviews.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-2">Pending Client Check-Ins</h2>
              <p className="text-sm text-zinc-400">Review and provide feedback for each client check-in</p>
            </div>
          )}

          {/* Pending Reviews List */}
          {!loading && pendingReviews.length > 0 && (
            <div className="space-y-3">
              {pendingReviews.map((review) => (
                <Link
                  key={review.id}
                  href={`/coach/review/${review.id}`}
                  className="block bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-6 transition-all hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Timestamp */}
                      <p className="text-xs text-zinc-500 mb-3 font-medium uppercase tracking-wide">
                        {new Date(review.created_at).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })} at {new Date(review.created_at).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>

                      {/* Metrics Grid */}
                      <div className="grid grid-cols-4 gap-3 mb-4">
                        <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
                          <p className="text-xs text-zinc-500 mb-1">Weight</p>
                          <p className="text-sm font-bold text-emerald-400">{review.weight} kg</p>
                        </div>
                        <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
                          <p className="text-xs text-zinc-500 mb-1">Intensity</p>
                          <p className="text-sm font-bold text-emerald-400">{review.workout_intensity}/10</p>
                        </div>
                        <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
                          <p className="text-xs text-zinc-500 mb-1">Sleep</p>
                          <p className="text-sm font-bold text-blue-400">{review.sleep_hours}h</p>
                        </div>
                        <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
                          <p className="text-xs text-zinc-500 mb-1">Nutrition</p>
                          <p className="text-sm font-bold text-emerald-400">{review.nutrition_adherence}/10</p>
                        </div>
                      </div>

                      {/* AI Analysis Preview */}
                      {review.analysis.coachResponse && (
                        <div className="bg-emerald-900/10 border border-emerald-700/20 rounded-lg p-3">
                          <p className="text-xs text-emerald-400 font-semibold mb-1 uppercase">AI Coach Message Preview</p>
                          <p className="text-sm text-zinc-300 line-clamp-1">{review.analysis.coachResponse}</p>
                        </div>
                      )}
                    </div>

                    {/* Action Arrow */}
                    <div className="flex-shrink-0 text-emerald-400 text-xl font-bold">→</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
