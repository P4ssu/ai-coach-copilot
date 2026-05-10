'use server'

import { createClient } from '@/lib/supabase/server'

export async function getClientInfo(userId: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase.auth.admin.getUserById(userId)

    if (error || !data.user) {
      return null
    }

    return {
      email: data.user.email || 'Unknown',
      name: data.user.user_metadata?.name || null,
    }
  } catch (err) {
    console.error('Error fetching client info:', err)
    return null
  }
}
