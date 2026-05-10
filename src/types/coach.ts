// Coaches and their clients management types

export interface Client {
  id: string
  coach_id: string
  email: string
  name: string | null
  phone: string | null
  status: 'active' | 'inactive' | 'archived'
  created_at: string
  updated_at: string
}

export interface ClientInvite {
  id: string
  coach_id: string
  email: string
  token: string
  status: 'pending' | 'accepted' | 'expired'
  accepted_at: string | null
  expires_at: string
  created_at: string
}

export interface ClientWithInviteStatus extends Client {
  invite_status?: 'pending' | 'accepted'
  invited_at?: string
}

export interface CreateClientRequest {
  email: string
  name?: string
  phone?: string
}
