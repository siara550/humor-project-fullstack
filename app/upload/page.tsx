import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import UploadAndCaption from "../protected/UploadAndCaption";

export default async function UploadPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-semibold mb-6">Generate Captions</h1>
      <UploadAndCaption />
    </main>
  );
}