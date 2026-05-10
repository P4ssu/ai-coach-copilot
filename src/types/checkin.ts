// Shared types for check-in functionality

export interface CoachingAnalysis {
  progressSummary: string
  recoveryStatus: string
  nutritionAnalysis: string
  suggestedAdjustments: string
  coachResponse: string
}

export interface CheckInFormData {
  weight: string
  workoutIntensity: string
  sleepHours: string
  nutritionAdherence: string
  nutritionNotes: string
  notes: string
}

export interface CheckInRecord {
  id: string
  user_id: string
  weight: number
  workout_intensity: number
  sleep_hours: number
  notes: string
  nutrition_adherence: number
  nutrition_notes: string
  status: 'pending_review' | 'approved'
  analysis: CoachingAnalysis
  created_at: string
}

export interface EditCheckInData {
  weight: string
  workout_intensity: string
  sleep_hours: string
  nutrition_adherence: string
  nutrition_notes: string
  notes: string
}
