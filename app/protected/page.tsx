import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function ProtectedPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  if (!data.user) redirect('/login')

  return (
    <main className="min-h-screen p-10">
      <h1 className="text-2xl font-semibold">Protected</h1>
      <p className="mt-2 text-sm text-black/70">You are signed in.</p>
    </main>
  )
}