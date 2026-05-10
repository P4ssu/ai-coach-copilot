'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/Header'

interface CheckInData {
  weight: string
  workoutIntensity: string
  sleepHours: string
  notes: string
}

interface CoachingAnalysis {
  progressSummary: string
  recoveryStatus: string
  nutritionAnalysis: string
  suggestedAdjustments: string
  coachResponse: string
}

interface SavedData {
  checkin: CheckInData
  analysis: CoachingAnalysis
  timestamp: string
}

export default function ResultsPage() {
  const [data, setData] = useState<SavedData | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('lastCheckin')
    if (saved) {
      setData(JSON.parse(saved))
    }
  }, [])

  if (!data) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <Header />
        <main className="flex-1 p-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No check-in found</h1>
          <Link href="/checkin" className="text-emerald-400 hover:text-emerald-300">
            Submit a check-in
          </Link>
        </div>
        </main>
      </div>
    )
  }

  const { checkin, analysis } = data

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />
      <main className="flex-1 p-8">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Check-In Submitted</h1>
          <p className="text-zinc-400">Your coach is reviewing this now</p>
        </div>

        {/* Pending Review Message */}
        <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-2xl p-6 space-y-2">
          <p className="text-emerald-400 text-sm font-semibold uppercase">Pending Coach Review</p>
          <p className="text-lg text-white leading-relaxed">Your coach will review this check-in at their earliest opportunity. You'll receive personalized feedback as soon as they approve it.</p>
        </div>

        {/* AI Draft (Preview) */}
        <div>
          <p className="text-sm font-semibold uppercase text-zinc-500 mb-4">AI Draft (Coach will personalize)</p>

          {/* Coach Response (Hero) */}
          <div className="bg-zinc-900/50 border border-zinc-700 rounded-2xl p-6 space-y-2">
            <p className="text-zinc-400 text-sm font-semibold uppercase">Coach Message</p>
            <p className="text-lg text-zinc-300 leading-relaxed">{analysis.coachResponse}</p>
          </div>

          {/* Analysis Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-zinc-900/50 border border-zinc-700 rounded-2xl p-6 space-y-2">
              <p className="text-zinc-500 text-sm font-semibold uppercase">Progress</p>
              <p className="text-zinc-400">{analysis.progressSummary}</p>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-700 rounded-2xl p-6 space-y-2">
              <p className="text-zinc-500 text-sm font-semibold uppercase">Recovery</p>
              <p className="text-zinc-400">{analysis.recoveryStatus}</p>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-700 rounded-2xl p-6 space-y-2">
              <p className="text-zinc-500 text-sm font-semibold uppercase">Nutrition</p>
              <p className="text-zinc-400">{analysis.nutritionAnalysis}</p>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-700 rounded-2xl p-6 space-y-2">
              <p className="text-zinc-500 text-sm font-semibold uppercase">Next Steps</p>
              <p className="text-zinc-400">{analysis.suggestedAdjustments}</p>
            </div>
          </div>
        </div>

        {/* Check-in Summary */}
        <div className="bg-zinc-900 rounded-2xl p-6 space-y-3 border border-zinc-800">
          <p className="text-sm font-semibold uppercase text-zinc-500">Your Check-In Data</p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-zinc-500 text-xs">Weight</p>
              <p className="text-lg font-bold text-emerald-400">{checkin.weight} kg</p>
            </div>
            <div>
              <p className="text-zinc-500 text-xs">Intensity</p>
              <p className="text-lg font-bold text-emerald-400">{checkin.workoutIntensity}/10</p>
            </div>
            <div>
              <p className="text-zinc-500 text-xs">Sleep</p>
              <p className="text-lg font-bold text-emerald-400">{checkin.sleepHours}h</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Link
            href="/dashboard"
            className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold py-3 rounded-xl text-center transition-colors"
          >
            Back to Dashboard
          </Link>
          <Link
            href="/checkin"
            className="flex-1 border border-zinc-700 hover:border-zinc-500 text-zinc-300 font-semibold py-3 rounded-xl text-center transition-colors"
          >
            Submit Another
          </Link>
        </div>

      </div>
      </main>
    </div>
  )
}
