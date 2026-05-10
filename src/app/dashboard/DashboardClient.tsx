'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/Header'
import { createClient } from '@/lib/supabase/client'
import { deleteCheckInFromDB } from '@/app/actions/checkin'
import { CheckInRecord, EditCheckInData } from '@/types/checkin'

interface DashboardClientProps {
  submitted: boolean
}

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

export function DashboardClient({ submitted }: DashboardClientProps) {
  const router = useRouter()
  const [showSuccess, setShowSuccess] = useState(submitted)
  const [latestStats, setLatestStats] = useState<CheckInRecord | null>(null)
  const [latestApprovedCheckin, setLatestApprovedCheckin] = useState<CheckInRecord | null>(null)
  const [allCheckins, setAllCheckins] = useState<CheckInRecord[]>([])
  const [selectedCheckin, setSelectedCheckin] = useState<CheckInRecord | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editData, setEditData] = useState<EditCheckInData | null>(null)
  const [saving, setSaving] = useState(false)
  const [timePeriod, setTimePeriod] = useState<'weekly' | 'monthly'>('weekly')
  const supabase = createClient()

  // Auto-dismiss success message and clean URL
  useEffect(() => {
    if (showSuccess) {
      // Remove the ?submitted query parameter from URL
      router.replace('/dashboard')

      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => setShowSuccess(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [showSuccess, router])

  function getMetricsForPeriod() {
    const now = new Date()
    const periodDays = timePeriod === 'weekly' ? 7 : 30
    const periodStart = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000)

    const checkinsPeriod = allCheckins.filter((c) => new Date(c.created_at) >= periodStart)
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Weight delta
    const latestWeight = allCheckins[0]?.weight || 0
    const weightWeekAgo = allCheckins.find((c) => new Date(c.created_at) <= weekAgo)?.weight || latestWeight
    const weightMonthAgo = allCheckins.find((c) => new Date(c.created_at) <= monthAgo)?.weight || latestWeight
    const weekDelta = latestWeight - weightWeekAgo
    const monthDelta = latestWeight - weightMonthAgo

    // Workout days
    const workoutDays = checkinsPeriod.filter((c) => c.workout_intensity > 0).length

    // Average sleep
    const avgSleep = checkinsPeriod.length > 0
      ? (checkinsPeriod.reduce((sum, c) => sum + c.sleep_hours, 0) / checkinsPeriod.length).toFixed(1)
      : 0

    return { weekDelta, monthDelta, workoutDays, avgSleep, checkinsPeriod }
  }

  const metrics = getMetricsForPeriod()

  useEffect(() => {
    async function loadCheckins() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('checkins')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (data && !error) {
        setAllCheckins(data)

        // Set latest stats (from most recent check-in)
        if (data.length > 0) {
          setLatestStats(data[0])
        }

        // Set latest approved check-in (for coach message)
        const approved = data.find((c) => c.status === 'approved')
        if (approved) {
          setLatestApprovedCheckin(approved)
        }
      }
    }

    loadCheckins()
  }, [])

  function startEdit() {
    if (selectedCheckin) {
      setEditData({
        weight: selectedCheckin.weight.toString(),
        workout_intensity: selectedCheckin.workout_intensity.toString(),
        sleep_hours: selectedCheckin.sleep_hours.toString(),
        nutrition_adherence: selectedCheckin.nutrition_adherence?.toString() || '5',
        nutrition_notes: selectedCheckin.nutrition_notes || '',
        notes: selectedCheckin.notes || '',
      })
      setIsEditMode(true)
    }
  }

  async function saveEdit() {
    if (!selectedCheckin || !editData) return
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setSaving(false)
      return
    }

    const { error } = await supabase
      .from('checkins')
      .update({
        weight: parseFloat(editData.weight),
        workout_intensity: parseInt(editData.workout_intensity),
        sleep_hours: parseFloat(editData.sleep_hours),
        nutrition_adherence: parseInt(editData.nutrition_adherence),
        nutrition_notes: editData.nutrition_notes,
        notes: editData.notes,
      })
      .eq('id', selectedCheckin.id)
      .eq('user_id', user.id)

    if (!error) {
      // Update the local state
      setAllCheckins(
        allCheckins.map((c) =>
          c.id === selectedCheckin.id
            ? {
                ...c,
                weight: parseFloat(editData.weight),
                workout_intensity: parseInt(editData.workout_intensity),
                sleep_hours: parseFloat(editData.sleep_hours),
                nutrition_adherence: parseInt(editData.nutrition_adherence),
                nutrition_notes: editData.nutrition_notes,
                notes: editData.notes,
              }
            : c
        )
      )
      setSelectedCheckin(null)
      setIsEditMode(false)
      setEditData(null)
    }
    setSaving(false)
  }

  async function deleteCheckin() {
    if (!selectedCheckin || selectedCheckin.status !== 'pending_review') return
    if (!confirm('Are you sure you want to delete this check-in? This action cannot be undone.')) return

    setSaving(true)

    try {
      await deleteCheckInFromDB(selectedCheckin.id)

      // Reload all check-ins from database
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: allData, error: fetchError } = await supabase
        .from('checkins')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      if (allData) {
        setAllCheckins(allData)
        setLatestStats(allData.length > 0 ? allData[0] : null)
        const approved = allData.find((c) => c.status === 'approved')
        setLatestApprovedCheckin(approved || null)
      }
      setSelectedCheckin(null)
    } catch (err) {
      alert('Failed to delete check-in: ' + String(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <style>{sliderStyles}</style>
      <Header />
      <main className="flex-1 p-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Success Message */}
        {showSuccess && (
          <div className="bg-emerald-900/20 border border-emerald-500/50 rounded-2xl p-6">
            <p className="text-emerald-400 font-semibold text-lg">✓ Check-in Submitted</p>
            <p className="text-white mt-2">Your coach is reviewing your data and will provide feedback shortly.</p>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Your Progress</h1>
            <p className="text-zinc-400 mt-2">Track your performance and get personalized coaching feedback.</p>
          </div>
          <Link
            href="/checkin"
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            New Check-In
          </Link>
        </div>

        {/* Latest Stats */}
        {latestStats ? (
          <div className="space-y-6">

            {/* Latest Coach Message - Only if approved */}
            {latestApprovedCheckin && (
              <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-2xl p-6">
                <p className="text-emerald-400 text-sm font-semibold uppercase mb-2">Latest Coach Message</p>
                <p className="text-lg text-white">{latestApprovedCheckin.analysis.coachResponse}</p>
              </div>
            )}

            {/* Time Period Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setTimePeriod('weekly')}
                className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                  timePeriod === 'weekly'
                    ? 'bg-emerald-500 text-black'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setTimePeriod('monthly')}
                className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                  timePeriod === 'monthly'
                    ? 'bg-emerald-500 text-black'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                Monthly
              </button>
            </div>

            {/* Visual Metrics */}
            <div className="grid grid-cols-3 gap-4">
              {/* Weight Delta */}
              <div className="bg-zinc-900 rounded-2xl p-6 space-y-3">
                <p className="text-xs font-semibold uppercase text-zinc-500">Current Weight</p>
                <div className="space-y-2">
                  <div>
                    <p className="text-3xl font-bold text-white">{latestStats.weight}</p>
                    <p className="text-xs text-zinc-500">kg</p>
                  </div>
                  <div className="pt-2 border-t border-zinc-800">
                    <p className="text-sm font-bold text-white">
                      {timePeriod === 'weekly'
                        ? `${metrics.weekDelta > 0 ? '+' : ''}${metrics.weekDelta.toFixed(1)} kg`
                        : `${metrics.monthDelta > 0 ? '+' : ''}${metrics.monthDelta.toFixed(1)} kg`
                      }
                    </p>
                    <p className="text-xs text-zinc-400">
                      {timePeriod === 'weekly' ? 'vs 7 days ago' : 'vs 30 days ago'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Workout Days */}
              <div className="bg-zinc-900 rounded-2xl p-6 space-y-3">
                <p className="text-xs font-semibold uppercase text-zinc-500">
                  {timePeriod === 'weekly' ? 'Workouts this week' : 'Workouts this month'}
                </p>
                <p className="text-3xl font-bold text-emerald-400">{metrics.workoutDays}</p>
              </div>

              {/* Avg Sleep */}
              <div className="bg-zinc-900 rounded-2xl p-6 space-y-3">
                <p className="text-xs font-semibold uppercase text-zinc-500">
                  {timePeriod === 'weekly' ? 'Avg sleep week' : 'Avg sleep month'}
                </p>
                <p className="text-3xl font-bold text-blue-400">{metrics.avgSleep}</p>
                <p className="text-xs text-zinc-500">hours</p>
              </div>
            </div>

            {/* Check-In History */}
            {allCheckins.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-bold mb-4">Your Check-Ins</h2>
                <div className="space-y-2">
                  {allCheckins.map((checkin) => (
                    <div
                      key={checkin.id}
                      onClick={() => setSelectedCheckin(checkin)}
                      className="rounded-xl p-4 flex items-center justify-between transition-colors cursor-pointer"
                      style={{
                        backgroundColor: checkin.status === 'pending_review' ? 'rgba(39, 39, 42, 0.5)' : 'rgb(24, 24, 27)',
                        border: checkin.status === 'pending_review' ? '1px solid rgba(168, 85, 247, 0.3)' : '1px solid rgb(39, 39, 42)',
                      }}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="text-sm text-zinc-500">
                            {new Date(checkin.created_at).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                          {checkin.status === 'pending_review' && (
                            <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded">Pending Review</span>
                          )}
                          {checkin.status === 'approved' && (
                            <span className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded">Approved</span>
                          )}
                        </div>
                        <p className="text-white font-medium">
                          {checkin.weight} kg • Intensity {checkin.workout_intensity}/10 • Sleep {checkin.sleep_hours}h
                        </p>
                      </div>
                      <p className="text-emerald-400">→</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Check-In Modal */}
            {selectedCheckin && (
              <div
                className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                onClick={(e) => e.target === e.currentTarget && setSelectedCheckin(null)}
              >
                <div className="bg-zinc-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-8 space-y-6">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-zinc-500 mb-1">
                          {new Date(selectedCheckin.created_at).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                        {selectedCheckin.status === 'pending_review' && (
                          <p className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded w-fit">Pending Review</p>
                        )}
                        {selectedCheckin.status === 'approved' && (
                          <p className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded w-fit">Approved</p>
                        )}
                      </div>
                      <button
                        onClick={() => setSelectedCheckin(null)}
                        className="text-zinc-500 hover:text-white text-2xl"
                      >
                        ×
                      </button>
                    </div>

                    {/* Pending Review - View or Edit Mode */}
                    {selectedCheckin.status === 'pending_review' && (
                      <>
                        {!isEditMode ? (
                          <>
                            <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-4">
                              <p className="text-purple-400 text-sm font-semibold mb-2">Waiting for Coach Review</p>
                              <p className="text-white text-sm">Your coach is reviewing this check-in. You can edit your data until they approve it.</p>
                            </div>

                            {/* Metrics */}
                            <div className="grid grid-cols-3 gap-4">
                              <div className="bg-zinc-800 rounded-xl p-4 text-center">
                                <p className="text-xs text-zinc-500 mb-2">Weight</p>
                                <p className="text-2xl font-bold text-white">{selectedCheckin.weight}</p>
                              </div>
                              <div className="bg-zinc-800 rounded-xl p-4 text-center">
                                <p className="text-xs text-zinc-500 mb-2">Intensity</p>
                                <p className="text-2xl font-bold text-emerald-400">{selectedCheckin.workout_intensity}/10</p>
                              </div>
                              <div className="bg-zinc-800 rounded-xl p-4 text-center">
                                <p className="text-xs text-zinc-500 mb-2">Sleep</p>
                                <p className="text-2xl font-bold text-blue-400">{selectedCheckin.sleep_hours}h</p>
                              </div>
                            </div>

                            {/* Nutrition Adherence */}
                            <div className="bg-zinc-800 rounded-xl p-4">
                              <p className="text-xs font-semibold uppercase text-zinc-500 mb-2">Nutrition Adherence</p>
                              <p className="text-lg font-bold text-emerald-400">{selectedCheckin.nutrition_adherence}/10</p>
                            </div>

                            {/* Submitted Notes */}
                            {(selectedCheckin.notes || selectedCheckin.nutrition_notes) && (
                              <div className="space-y-3">
                                {selectedCheckin.nutrition_notes && (
                                  <div className="bg-zinc-800 rounded-xl p-4">
                                    <p className="text-xs font-semibold uppercase text-zinc-500 mb-2">Nutrition Notes</p>
                                    <p className="text-sm text-zinc-300">{selectedCheckin.nutrition_notes}</p>
                                  </div>
                                )}
                                {selectedCheckin.notes && (
                                  <div className="bg-zinc-800 rounded-xl p-4">
                                    <p className="text-xs font-semibold uppercase text-zinc-500 mb-2">Notes</p>
                                    <p className="text-sm text-zinc-300">{selectedCheckin.notes}</p>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Edit Button */}
                            <button
                              onClick={startEdit}
                              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold py-3 rounded-xl transition-colors"
                            >
                              Edit Check-In
                            </button>
                          </>
                        ) : (
                          <>
                            <div className="space-y-4">
                              {/* Weight */}
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Weight (kg)</label>
                                <input
                                  type="number"
                                  step="0.1"
                                  value={editData?.weight || ''}
                                  onChange={(e) => setEditData({ ...editData!, weight: e.target.value })}
                                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                                />
                              </div>

                              {/* Intensity */}
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Intensity: {editData?.workout_intensity}/10</label>
                                <input
                                  type="range"
                                  min="0"
                                  max="10"
                                  value={editData?.workout_intensity || '5'}
                                  onChange={(e) => setEditData({ ...editData!, workout_intensity: e.target.value })}
                                  className="w-full h-2 accent-emerald-500"
                                  style={{
                                    background: `linear-gradient(to right, rgb(16, 185, 129) 0%, rgb(16, 185, 129) ${(Number(editData?.workout_intensity || '5') / 10) * 100}%, rgb(39, 39, 42) ${(Number(editData?.workout_intensity || '5') / 10) * 100}%, rgb(39, 39, 42) 100%)`
                                  }}
                                />
                              </div>

                              {/* Sleep */}
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Sleep Hours</label>
                                <input
                                  type="number"
                                  step="0.5"
                                  value={editData?.sleep_hours || ''}
                                  onChange={(e) => setEditData({ ...editData!, sleep_hours: e.target.value })}
                                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                                />
                              </div>

                              {/* Nutrition Adherence */}
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Nutrition Adherence: {editData?.nutrition_adherence}/10</label>
                                <input
                                  type="range"
                                  min="1"
                                  max="10"
                                  value={editData?.nutrition_adherence || '5'}
                                  onChange={(e) => setEditData({ ...editData!, nutrition_adherence: e.target.value })}
                                  className="w-full h-2 accent-emerald-500"
                                  style={{
                                    background: `linear-gradient(to right, rgb(16, 185, 129) 0%, rgb(16, 185, 129) ${((Number(editData?.nutrition_adherence || '5') - 1) / 9) * 100}%, rgb(39, 39, 42) ${((Number(editData?.nutrition_adherence || '5') - 1) / 9) * 100}%, rgb(39, 39, 42) 100%)`
                                  }}
                                />
                              </div>

                              {/* Nutrition Notes */}
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Nutrition Notes</label>
                                <textarea
                                  value={editData?.nutrition_notes || ''}
                                  onChange={(e) => setEditData({ ...editData!, nutrition_notes: e.target.value })}
                                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 resize-none"
                                  rows={2}
                                  placeholder="Any nutrition notes..."
                                />
                              </div>

                              {/* General Notes */}
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Notes</label>
                                <textarea
                                  value={editData?.notes || ''}
                                  onChange={(e) => setEditData({ ...editData!, notes: e.target.value })}
                                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 resize-none"
                                  rows={2}
                                  placeholder="Any other notes..."
                                />
                              </div>
                            </div>

                            {/* Save/Cancel Buttons */}
                            <div className="flex gap-3">
                              <button
                                onClick={saveEdit}
                                disabled={saving}
                                className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-semibold py-3 rounded-xl transition-colors"
                              >
                                {saving ? 'Saving...' : 'Save Changes'}
                              </button>
                              <button
                                onClick={() => {
                                  setIsEditMode(false)
                                  setEditData(null)
                                }}
                                className="flex-1 border border-zinc-700 hover:border-zinc-500 text-zinc-300 font-semibold py-3 rounded-xl transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </>
                        )}
                      </>
                    )}

                    {/* Approved - Show Coach Feedback */}
                    {selectedCheckin.status === 'approved' && (
                      <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-xl p-4">
                        <p className="text-emerald-400 text-sm font-semibold uppercase mb-2">Coach Message</p>
                        <p className="text-white">{selectedCheckin.analysis.coachResponse}</p>
                      </div>
                    )}

                    {/* Analysis - Only show if approved */}
                    {selectedCheckin.status === 'approved' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-zinc-800 rounded-xl p-4">
                          <p className="text-xs font-semibold uppercase text-zinc-500 mb-2">Progress</p>
                          <p className="text-sm text-zinc-300">{selectedCheckin.analysis.progressSummary}</p>
                        </div>
                        <div className="bg-zinc-800 rounded-xl p-4">
                          <p className="text-xs font-semibold uppercase text-zinc-500 mb-2">Recovery</p>
                          <p className="text-sm text-zinc-300">{selectedCheckin.analysis.recoveryStatus}</p>
                        </div>
                        <div className="bg-zinc-800 rounded-xl p-4">
                          <p className="text-xs font-semibold uppercase text-zinc-500 mb-2">Nutrition</p>
                          <p className="text-sm text-zinc-300">{selectedCheckin.analysis.nutritionAnalysis}</p>
                        </div>
                        <div className="bg-zinc-800 rounded-xl p-4">
                          <p className="text-xs font-semibold uppercase text-zinc-500 mb-2">Next Steps</p>
                          <p className="text-sm text-zinc-300">{selectedCheckin.analysis.suggestedAdjustments}</p>
                        </div>
                      </div>
                    )}

                    {/* Delete Button - Only show for pending review */}
                    {selectedCheckin.status === 'pending_review' && (
                      <button
                        onClick={deleteCheckin}
                        disabled={saving}
                        className="w-full bg-red-900/20 hover:bg-red-900/40 border border-red-700/50 text-red-400 font-semibold py-3 rounded-xl transition-colors disabled:opacity-50"
                      >
                        {saving ? 'Deleting...' : 'Delete'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        ) : (
          <div className="bg-zinc-900 rounded-2xl p-8 text-center border border-zinc-800 border-dashed">
            <h2 className="text-xl font-bold mb-2">No check-ins yet</h2>
            <p className="text-zinc-400 mb-6">Submit your first check-in to get started.</p>
            <Link
              href="/checkin"
              className="inline-block bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Submit Check-In
            </Link>
          </div>
        )}

      </div>
      </main>
    </div>
  )
}
