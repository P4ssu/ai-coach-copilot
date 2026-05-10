-- Clients table: stores coach's clients
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  phone VARCHAR(20),
  status VARCHAR(50) DEFAULT 'active', -- active, inactive, archived
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(coach_id, email)
);

-- Invites table: tracks invitation tokens for clients
CREATE TABLE IF NOT EXISTS client_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, expired
  accepted_at TIMESTAMP,
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(coach_id, email)
);

-- Update checkins table to include coach_id relationship
ALTER TABLE checkins ADD COLUMN coach_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE checkins ADD COLUMN client_id UUID REFERENCES clients(id) ON DELETE CASCADE;

-- Enable RLS on clients table
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- RLS policy: Coaches can only see their own clients
CREATE POLICY clients_coach_access ON clients
  FOR ALL
  USING (coach_id = auth.uid())
  WITH CHECK (coach_id = auth.uid());

-- Enable RLS on client_invites table
ALTER TABLE client_invites ENABLE ROW LEVEL SECURITY;

-- RLS policy: Coaches can only see their own invites
CREATE POLICY invites_coach_access ON client_invites
  FOR ALL
  USING (coach_id = auth.uid())
  WITH CHECK (coach_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_clients_coach_id ON clients(coach_id);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_invites_coach_id ON client_invites(coach_id);
CREATE INDEX IF NOT EXISTS idx_invites_token ON client_invites(token);
CREATE INDEX IF NOT EXISTS idx_invites_email ON client_invites(email);
