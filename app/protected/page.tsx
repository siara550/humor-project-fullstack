import { createClient } from "@/lib/supabase/server";
import VoteButtons from "./VoteButtons";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: captions, error } = await supabase
    .from("captions")
    .select("id, content")
    .limit(30);

  if (error) {
    return <div className="p-6">Error loading captions: {error.message}</div>;
  }

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-semibold">Meme Feed</h1>
      <p className="mt-2 text-white/70">You are signed in.</p>

      <div className="mt-8 grid gap-4">
        {captions?.map((c) => (
          <div key={c.id} className="rounded-2xl border border-white/10 p-5">
            <div className="text-lg">{c.content}</div>
            <div className="mt-4">
              <VoteButtons captionId={c.id} />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
