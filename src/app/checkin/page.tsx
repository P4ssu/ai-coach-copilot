'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { analyzeCheckIn, saveCheckInToDB } from '@/app/actions/checkin'
import { Header } from '@/components/Header'
import { CheckInFormData } from '@/types/checkin'

const sliderStyles = `
  input[type="range"] {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 8px;
    border-radius: 8px;
    outline: none;
    transition: all 0.2s ease;
  }

  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: rgb(16, 185, 129);
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(16, 185, 129, 0.4);
    transition: all 0.2s ease;
  }

  input[type="range"]::-webkit-slider-thumb:hover {
    width: 16px;
    height: 16px;
    box-shadow: 0 2px 8px rgba(16, 185, 129, 0.6);
  }

  input[type="range"]::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: rgb(16, 185, 129);
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 6px rgba(16, 185, 129, 0.4);
    transition: all 0.2s ease;
  }

  input[type="range"]::-moz-range-thumb:hover {
    width: 16px;
    height: 16px;
    box-shadow: 0 2px 8px rgba(16, 185, 129, 0.6);
  }

  input[type="range"]::-moz-range-track {
    background: transparent;
    border: none;
  }

  input[type="range"]::-moz-range-progress {
    background: rgb(16, 185, 129);
    height: 8px;
    border-radius: 8px;
  }
`

export default function CheckInPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState<CheckInFormData>({
    weight: '',
    workoutIntensity: '5',
    sleepHours: '',
    nutritionAdherence: '5',
    nutritionNotes: '',
    notes: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Call Claude API for analysis
      const analysis = await analyzeCheckIn(formData)

      // Save to Supabase database
      await saveCheckInToDB(formData, analysis)

      // Store in localStorage for results page display
      localStorage.setItem(
        'lastCheckin',
        JSON.stringify({
          checkin: formData,
          analysis: analysis,
          timestamp: new Date().toISOString(),
        })
      )

      // Redirect to dashboard with success flag
      router.push('/dashboard?submitted=true')
    } catch (err) {
      setError('Failed to submit check-in. Try again.')
      console.error(err)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <style>{sliderStyles}</style>
      <Header />
      <main className="flex-1 p-8">
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Today's Check-In</h1>
          <p className="text-zinc-400">Takes 30 seconds. Let's analyze your progress.</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-emerald-900/20 border border-emerald-500/50 rounded-xl p-4 text-center">
            <p className="text-emerald-400 font-semibold">✓ Analysis complete! Redirecting...</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Weight */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">
              Current Weight (kg)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              required
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="85"
            />
          </div>

          {/* Workout Intensity */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">
              Workout Intensity: <span className="text-emerald-400">{formData.workoutIntensity}</span>/10
            </label>
            <input
              type="range"
              min="0"
              max="10"
              value={formData.workoutIntensity}
              onChange={(e) => setFormData({ ...formData, workoutIntensity: e.target.value })}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              style={{
                background: `linear-gradient(to right, rgb(16, 185, 129) 0%, rgb(16, 185, 129) ${(Number(formData.workoutIntensity) / 10) * 100}%, rgb(39, 39, 42) ${(Number(formData.workoutIntensity) / 10) * 100}%, rgb(39, 39, 42) 100%)`
              }}
            />
            <p className="text-xs text-zinc-500">How hard did you train today? <span className="text-zinc-400">(0 = didn't work out)</span></p>
          </div>

          {/* Sleep */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">
              Sleep Hours
            </label>
            <input
              type="number"
              step="0.5"
              value={formData.sleepHours}
              onChange={(e) => setFormData({ ...formData, sleepHours: e.target.value })}
              required
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="7.5"
            />
          </div>

          {/* Nutrition Adherence */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">
              Nutrition Adherence: <span className="text-emerald-400">{formData.nutritionAdherence}</span>/10
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={formData.nutritionAdherence}
              onChange={(e) => setFormData({ ...formData, nutritionAdherence: e.target.value })}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              style={{
                background: `linear-gradient(to right, rgb(16, 185, 129) 0%, rgb(16, 185, 129) ${((Number(formData.nutritionAdherence) - 1) / 9) * 100}%, rgb(39, 39, 42) ${((Number(formData.nutritionAdherence) - 1) / 9) * 100}%, rgb(39, 39, 42) 100%)`
              }}
            />
            <p className="text-xs text-zinc-500">How well did you stick to your nutrition plan?</p>
          </div>

          {/* Nutrition Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">
              Nutrition Notes (Optional)
            </label>
            <textarea
              value={formData.nutritionNotes}
              onChange={(e) => setFormData({ ...formData, nutritionNotes: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
              rows={2}
              placeholder="Any problem with meal plan? Meals you tracked? What did you eat?"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
              rows={4}
              placeholder="How did you feel? Diet adherence? Any injuries? Anything else the coach should know?"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || success}
            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold py-3 rounded-xl transition-colors"
          >
            {success ? '✓ Done!' : loading ? 'Analyzing...' : 'Submit & Get Analysis'}
          </button>

        </form>

      </div>
      </main>
    </div>
  )
}
