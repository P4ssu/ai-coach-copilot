'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export function Header() {
  const router = useRouter()
  const supabase = createClient()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser()
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL

      if (user && adminEmail && user.email === adminEmail) {
        setIsAdmin(true)
      }
      setLoading(false)
    }

    checkAdmin()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <header className="bg-black border-b border-zinc-800/50">
      <div className="max-w-6xl mx-auto px-8 py-5 flex items-center justify-between">
        {/* Logo and Brand */}
        <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          {/* Vexlon Logo */}
          <svg
            className="w-9 h-9"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* X Logo - Geometric design */}
            <g stroke="white" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round">
              {/* Top-left to bottom-right stroke */}
              <line x1="25" y1="25" x2="75" y2="75" />
              {/* Top-right to bottom-left stroke */}
              <line x1="75" y1="25" x2="25" y2="75" />
            </g>
          </svg>

          {/* Brand Text */}
          <div className="flex flex-col">
            <span className="text-lg font-bold text-white tracking-tight">Vexlon</span>
            <span className="text-xs text-emerald-400 font-medium">Training Platform</span>
          </div>
        </Link>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link
              href="/admin/invite-coach"
              className="px-4 py-2 text-sm font-medium text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/20 rounded-lg transition-all duration-200 border border-emerald-700/0 hover:border-emerald-700"
            >
              Invite Coach
            </Link>
          )}
          <Link
            href="/coach/profile"
            className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-900/50 rounded-lg transition-all duration-200 border border-zinc-800/0 hover:border-zinc-700"
          >
            Profile
          </Link>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-900/50 rounded-lg transition-all duration-200 border border-zinc-800/0 hover:border-zinc-700"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
