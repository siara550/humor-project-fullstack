'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/browser'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)

  const signInWithGoogle = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      const origin = window.location.origin

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback`,
        },
      })

      if (error) alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-8">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl">
        <p className="text-xs text-white/60">Week 3 · Auth Flow</p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Welcome back</h1>
        <p className="mt-2 text-sm text-white/70">
          Sign in with Google to access your protected dashboard.
        </p>

        <button
          onClick={signInWithGoogle}
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-white px-4 py-3 text-sm font-medium text-black transition hover:bg-white/90 disabled:opacity-60"
        >
          {loading ? 'Opening Google…' : 'Continue with Google'}
        </button>

        <p className="mt-4 text-xs text-white/50 text-center">
          Redirect URI: <span className="font-mono">/auth/callback</span>
        </p>
      </div>
    </main>
  )
}
