'use server'

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

export interface CheckInData {
  weight: string
  workoutIntensity: string
  sleepHours: string
  nutritionAdherence: string
  nutritionNotes: string
  notes: string
}

export interface CoachingAnalysis {
  progressSummary: string
  recoveryStatus: string
  nutritionAnalysis: string
  suggestedAdjustments: string
  coachResponse: string
}

export async function analyzeCheckIn(
  checkin: CheckInData
): Promise<CoachingAnalysis> {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not set in environment variables')
  }

  const client = new Anthropic({
    apiKey,
  })

  const prompt = `You are an expert bodybuilding coach. Analyze this athlete's check-in and provide structured coaching feedback.

Check-in Data:
- Weight: ${checkin.weight} kg
- Workout Intensity: ${checkin.workoutIntensity}/10
- Sleep: ${checkin.sleepHours} hours
- Nutrition Adherence: ${checkin.nutritionAdherence}/10
- Nutrition Notes: ${checkin.nutritionNotes || '(none provided)'}
- General Notes: ${checkin.notes}

For the nutritionAnalysis field:
${checkin.nutritionNotes ? '- They provided nutrition notes: analyze them specifically and suggest improvements or alternatives\n- Give concrete advice on what to replace, adjust, or do differently' : '- Only the adherence slider (${checkin.nutritionAdherence}/10) is provided\n- Based on the score, give motivational feedback: if high (7-10), encourage them to maintain; if low (1-6), motivate them to get back on track with the plan'}

Respond with ONLY valid JSON (no markdown, no code blocks), with these exact fields:
{
  "progressSummary": "1-2 sentences about their progress",
  "recoveryStatus": "Analysis of sleep and recovery",
  "nutritionAnalysis": "Nutrition feedback: detailed advice if notes provided, or motivational message based on adherence score",
  "suggestedAdjustments": "Specific actionable adjustments for next week",
  "coachResponse": "Encouraging, brief coach message"
}

Be concise. Be specific. Be actionable.`

  const message = await client.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  const responseText =
    message.content[0].type === 'text' ? message.content[0].text : ''

  // Parse the JSON response
  const analysis = JSON.parse(responseText) as CoachingAnalysis

  return analysis
}

export async function saveCheckInToDB(
  checkin: CheckInData,
  analysis: CoachingAnalysis
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('checkins')
    .insert({
      user_id: user.id,
      weight: parseFloat(checkin.weight),
      workout_intensity: parseInt(checkin.workoutIntensity),
      sleep_hours: parseFloat(checkin.sleepHours),
      nutrition_adherence: parseInt(checkin.nutritionAdherence),
      nutrition_notes: checkin.nutritionNotes,
      notes: checkin.notes,
      analysis,
      status: 'pending_review',
    })

  if (error) throw error
}

export async function deleteCheckInFromDB(checkInId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Delete the check-in (RLS policy ensures user can only delete their own)
  const { error } = await supabase
    .from('checkins')
    .delete()
    .eq('id', checkInId)

  if (error) {
    throw new Error(`Failed to delete check-in: ${error.message}`)
  }

  return { success: true }
}
