'use client'

import { createClient } from '@/lib/supabase/browser'

export default function LoginPage() {
  const signInWithGoogle = async () => {
    const supabase = createClient()
    const origin = window.location.origin

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    })

    if (error) {
      alert(error.message)
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-xl backdrop-blur">

        <div className="mb-6">
          <p className="text-sm text-white/60">Week 3 · Auth Flow</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Welcome Back
          </h1>
          <p className="mt-2 text-white/60">
            Sign in with Google to access your protected dashboard.
          </p>
        </div>

        <button
          onClick={signInWithGoogle}
          className="w-full rounded-xl bg-white px-4 py-3 text-black font-medium hover:bg-white/90 transition-all duration-200"
        >
          Continue with Google
        </button>

        <div className="mt-6 text-xs text-white/40 text-center">
          Redirect URI: /auth/callback
        </div>

      </div>
    </main>
  )
}
