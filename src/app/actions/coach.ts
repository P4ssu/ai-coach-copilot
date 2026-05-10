'use server'

import { createClient } from '@/lib/supabase/server'
import { Client, ClientInvite, CreateClientRequest } from '@/types/coach'
import { sendClientInviteEmail } from '@/lib/email'
import crypto from 'crypto'

/**
 * Generate a secure random token for invite links
 */
function generateInviteToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Create a new client and send invite
 */
export async function createClientAndSendInvite(
  clientData: CreateClientRequest
): Promise<{ success: boolean; error?: string; inviteId?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  try {
    // Get coach info for email
    const { data: { user: coachUser } } = await supabase.auth.getUser()
    const coachEmail = coachUser?.email || ''

    // Fetch coach name from coaches table
    const { data: coachProfile } = await supabase
      .from('coaches')
      .select('name')
      .eq('id', user.id)
      .single()

    const coachName = coachProfile?.name || coachEmail.split('@')[0]

    // Generate secure invite token
    const inviteToken = generateInviteToken()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 day expiry

    // Create invite record
    const { data: inviteData, error: inviteError } = await supabase
      .from('client_invites')
      .insert({
        coach_id: user.id,
        email: clientData.email,
        token: inviteToken,
        status: 'pending',
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single()

    if (inviteError) {
      // Handle duplicate invite
      if (inviteError.code === '23505' || inviteError.message.includes('duplicate')) {
        return { success: false, error: 'This email already has a pending invite' }
      }
      return { success: false, error: inviteError.message }
    }

    // Send invite email
    const emailResult = await sendClientInviteEmail(
      clientData.email,
      clientData.name,
      coachName,
      inviteToken
    )

    if (!emailResult.success) {
      console.error('Failed to send invite email:', emailResult.error)
      // In development/sandbox mode, log the invite link for manual testing
      if (process.env.NODE_ENV !== 'production') {
        const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/register?token=${inviteToken}&email=${encodeURIComponent(clientData.email)}`
        console.log(`
          ========================================
          CLIENT INVITE LINK (Sandbox Mode)
          ========================================
          Client Email: ${clientData.email}
          Client Name: ${clientData.name}
          Invite Link: ${inviteLink}
          Token: ${inviteToken}
          ========================================
        `)
      }
      // Still consider it a success since the invite was created
      // User can resend the email manually or use the link from console
    }

    return {
      success: true,
      inviteId: inviteData.id,
    }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}

/**
 * Get all clients for the authenticated coach
 */
export async function getCoachClients(): Promise<Client[]> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('coach_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching clients:', error)
    return []
  }

  return data || []
}

/**
 * Get client invites with their status
 */
export async function getCoachClientInvites(): Promise<ClientInvite[]> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('client_invites')
    .select('*')
    .eq('coach_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching invites:', error)
    return []
  }

  return data || []
}

/**
 * Get combined view: clients + pending invites
 */
export async function getCoachClientsWithInvites(): Promise<{
  clients: Client[]
  invites: ClientInvite[]
}> {
  const [clients, invites] = await Promise.all([
    getCoachClients(),
    getCoachClientInvites(),
  ])

  return { clients, invites }
}

/**
 * Update client information
 */
export async function updateClient(
  clientId: string,
  updates: Partial<Client>
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  try {
    // Verify ownership
    const { data: client } = await supabase
      .from('clients')
      .select('coach_id')
      .eq('id', clientId)
      .single()

    if (!client || client.coach_id !== user.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const { error } = await supabase
      .from('clients')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', clientId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}

/**
 * Resend invite to a client
 */
export async function resendClientInvite(
  inviteId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  try {
    // Verify ownership and get invite
    const { data: invite } = await supabase
      .from('client_invites')
      .select('*')
      .eq('id', inviteId)
      .eq('coach_id', user.id)
      .single()

    if (!invite) {
      return { success: false, error: 'Invite not found' }
    }

    // Update expiry
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    const { error } = await supabase
      .from('client_invites')
      .update({
        expires_at: expiresAt.toISOString(),
      })
      .eq('id', inviteId)

    if (error) {
      return { success: false, error: error.message }
    }

    // Get coach info for email
    const { data: coachProfile } = await supabase
      .from('coaches')
      .select('name')
      .eq('id', user.id)
      .single()

    const coachName = coachProfile?.name || user.email?.split('@')[0]

    // Send invite email
    const emailResult = await sendClientInviteEmail(
      invite.email,
      invite.client_name || undefined,
      coachName,
      invite.token
    )

    if (!emailResult.success) {
      console.error('Failed to resend invite email:', emailResult.error)
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}

/**
 * Validate and process invite token during registration
 */
export async function validateAndAcceptInvite(
  token: string,
  email: string
): Promise<{ success: boolean; coachId?: string; error?: string }> {
  const supabase = await createClient()

  try {
    // Find the invite
    const { data: invite, error: inviteError } = await supabase
      .from('client_invites')
      .select('*')
      .eq('token', token)
      .eq('email', email)
      .single()

    if (inviteError || !invite) {
      return { success: false, error: 'Invalid or expired invite' }
    }

    // Check if expired
    if (new Date(invite.expires_at) < new Date()) {
      return { success: false, error: 'Invite has expired' }
    }

    // Check if already accepted
    if (invite.status === 'accepted') {
      return { success: false, error: 'Invite already used' }
    }

    return { success: true, coachId: invite.coach_id }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}

/**
 * Mark invite as accepted and create client record
 */
export async function acceptInviteAndCreateClient(
  token: string,
  email: string,
  userId: string,
  name?: string
): Promise<{ success: boolean; error?: string; clientId?: string }> {
  const supabase = await createClient()

  try {
    // Find and update the invite
    const { data: invite, error: inviteError } = await supabase
      .from('client_invites')
      .select('*')
      .eq('token', token)
      .eq('email', email)
      .single()

    if (inviteError || !invite) {
      return { success: false, error: 'Invalid invite' }
    }

    // Update invite status
    const { error: updateError } = await supabase
      .from('client_invites')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
      })
      .eq('id', invite.id)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    // Create client record with name
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .insert({
        id: userId,
        coach_id: invite.coach_id,
        email: email,
        name: name || null,
        phone: null,
        bio: null,
        status: 'active',
      })
      .select()
      .single()

    if (clientError) {
      return { success: false, error: clientError.message }
    }

    return { success: true, clientId: clientData.id }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}

/**
 * Delete a client invite
 */
export async function deleteClientInvite(
  inviteId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  try {
    // Verify ownership
    const { data: invite } = await supabase
      .from('client_invites')
      .select('coach_id')
      .eq('id', inviteId)
      .single()

    if (!invite || invite.coach_id !== user.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const { error } = await supabase
      .from('client_invites')
      .delete()
      .eq('id', inviteId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}

/**
 * Get coach profile (auto-creates if missing)
 */
export async function getCoachProfile(): Promise<{
  id: string
  name: string
  bio: string | null
  phone: string | null
  email: string
} | null> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  let { data } = await supabase
    .from('coaches')
    .select('id, name, bio, phone')
    .eq('id', user.id)
    .single()

  // If profile doesn't exist, create it
  if (!data) {
    const { data: newProfile, error } = await supabase
      .from('coaches')
      .insert({
        id: user.id,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'Coach',
      })
      .select('id, name, bio, phone')
      .single()

    if (error) {
      console.error('Error creating coach profile:', error)
      return null
    }

    data = newProfile
  }

  if (data) {
    return {
      ...data,
      email: user.email || '',
    }
  }

  return null
}

/**
 * Update coach profile
 */
export async function updateCoachProfile(
  updates: { name?: string; bio?: string; phone?: string }
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  try {
    const { error } = await supabase
      .from('coaches')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}

/**
 * Generate a coach invite
 */
export async function generateCoachInvite(
  email: string
): Promise<{ success: boolean; error?: string; inviteLink?: string }> {
  const supabase = await createClient()

  try {
    // Check if email already has a pending invite
    const { data: existingInvite } = await supabase
      .from('coach_invites')
      .select('id')
      .eq('email', email)
      .eq('status', 'pending')
      .single()

    if (existingInvite) {
      return { success: false, error: 'This email already has a pending invite' }
    }

    // Generate secure token
    const inviteToken = generateInviteToken()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 day expiry

    // Create invite record
    const { data: inviteData, error: inviteError } = await supabase
      .from('coach_invites')
      .insert({
        email: email,
        token: inviteToken,
        status: 'pending',
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single()

    if (inviteError) {
      return { success: false, error: inviteError.message }
    }

    // Generate invite link
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/register-coach?token=${inviteToken}&email=${encodeURIComponent(email)}`

    // Log in development/sandbox mode for manual testing
    if (process.env.NODE_ENV !== 'production') {
      console.log(`
        ========================================
        COACH INVITE LINK (Sandbox Mode)
        ========================================
        Coach Email: ${email}
        Invite Link: ${inviteLink}
        Token: ${inviteToken}
        ========================================
      `)
    }

    return {
      success: true,
      inviteLink,
    }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}

/**
 * Validate coach invite token during registration
 */
export async function validateCoachInvite(
  token: string,
  email: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  try {
    // Find the invite
    const { data: invite, error: inviteError } = await supabase
      .from('coach_invites')
      .select('*')
      .eq('token', token)
      .eq('email', email)
      .single()

    if (inviteError || !invite) {
      return { success: false, error: 'Invalid or expired invite' }
    }

    // Check if expired
    if (new Date(invite.expires_at) < new Date()) {
      return { success: false, error: 'Invite has expired' }
    }

    // Check if already accepted
    if (invite.status === 'accepted') {
      return { success: false, error: 'Invite already used' }
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}

/**
 * Accept coach invite and create coach account
 */
export async function acceptCoachInviteAndCreateAccount(
  token: string,
  email: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  try {
    // Find and update the invite
    const { data: invite, error: inviteError } = await supabase
      .from('coach_invites')
      .select('*')
      .eq('token', token)
      .eq('email', email)
      .single()

    if (inviteError || !invite) {
      return { success: false, error: 'Invalid invite' }
    }

    // Update invite status
    const { error: updateError } = await supabase
      .from('coach_invites')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
      })
      .eq('id', invite.id)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    // Create coach profile (will be auto-created by trigger, but ensure it exists)
    const { error: coachError } = await supabase
      .from('coaches')
      .upsert({
        id: userId,
        name: email.split('@')[0], // Default name from email
      })

    if (coachError) {
      console.error('Error creating coach profile:', coachError)
      // Don't fail here - profile might already exist from trigger
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}

/**
 * Delete a client
 */
export async function deleteClient(
  clientId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  try {
    // Verify ownership
    const { data: client } = await supabase
      .from('clients')
      .select('coach_id')
      .eq('id', clientId)
      .single()

    if (!client || client.coach_id !== user.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', clientId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}

/**
 * Request email change for a client (sends verification email to new address)
 */
export async function requestClientEmailChange(
  clientId: string,
  newEmail: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  try {
    // Verify ownership and get client info
    const { data: client } = await supabase
      .from('clients')
      .select('coach_id, name, email')
      .eq('id', clientId)
      .single()

    if (!client || client.coach_id !== user.id) {
      return { success: false, error: 'Unauthorized' }
    }

    // Check if new email is same as current
    if (newEmail === client.email) {
      return { success: false, error: 'New email must be different from current email' }
    }

    // Get coach name
    const { data: coachProfile } = await supabase
      .from('coaches')
      .select('name')
      .eq('id', user.id)
      .single()

    const coachName = coachProfile?.name || 'Your Coach'

    // Generate verification token
    const verificationToken = generateInviteToken()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 1) // 24 hour expiry

    // Create pending email change record
    const { data: pendingChange, error: pendingError } = await supabase
      .from('pending_email_changes')
      .insert({
        client_id: clientId,
        new_email: newEmail,
        token: verificationToken,
        verified: false,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single()

    if (pendingError) {
      return { success: false, error: pendingError.message }
    }

    // Send verification email
    const { sendEmailVerificationEmail } = await import('@/lib/email')
    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email-change?token=${verificationToken}`

    // In sandbox mode (development), send to verified email with a note
    // In production, send to the actual new email
    const emailToSendTo = process.env.NODE_ENV === 'production' ? newEmail : 'kirill.paskov@hotmail.com'

    const emailResult = await sendEmailVerificationEmail(
      emailToSendTo,
      verificationLink,
      client.name || 'Client',
      coachName
    )

    if (!emailResult.success) {
      console.error('Email send failed:', emailResult.error)
      // In development/sandbox, still consider it success and log the link for manual testing
      if (process.env.NODE_ENV !== 'production') {
        console.log(`
          ========================================
          EMAIL VERIFICATION LINK (Sandbox Mode)
          ========================================
          Client: ${client.name || 'Client'}
          New Email: ${newEmail}
          Verification Link: ${verificationLink}
          Token: ${verificationToken}
          ========================================
        `)
        return { success: true }
      }
      return { success: false, error: 'Failed to send verification email' }
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}

/**
 * Verify and apply email change
 */
export async function verifyClientEmailChange(
  token: string
): Promise<{ success: boolean; error?: string; clientId?: string; newEmail?: string }> {
  const supabase = await createClient()

  try {
    // Find pending email change
    const { data: pendingChange } = await supabase
      .from('pending_email_changes')
      .select('*')
      .eq('token', token)
      .eq('verified', false)
      .single()

    if (!pendingChange) {
      return { success: false, error: 'Invalid or expired verification link' }
    }

    // Check if expired
    if (new Date(pendingChange.expires_at) < new Date()) {
      return { success: false, error: 'Verification link has expired' }
    }

    // Mark as verified
    const { error: updateError } = await supabase
      .from('pending_email_changes')
      .update({
        verified: true,
      })
      .eq('id', pendingChange.id)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    // Get client's auth user ID
    const { data: client } = await supabase
      .from('clients')
      .select('id, email')
      .eq('id', pendingChange.client_id)
      .single()

    if (!client) {
      return { success: false, error: 'Client not found' }
    }

    // Update client email in clients table
    const { error: clientError } = await supabase
      .from('clients')
      .update({
        email: pendingChange.new_email,
        updated_at: new Date().toISOString(),
      })
      .eq('id', pendingChange.client_id)

    if (clientError) {
      return { success: false, error: clientError.message }
    }

    // Update auth user email
    const { error: authError } = await supabase.auth.admin.updateUserById(
      pendingChange.client_id,
      { email: pendingChange.new_email }
    )

    if (authError) {
      return { success: false, error: authError.message }
    }

    return {
      success: true,
      clientId: pendingChange.client_id,
      newEmail: pendingChange.new_email,
    }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}
