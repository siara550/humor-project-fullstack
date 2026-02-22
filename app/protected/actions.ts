"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitVote(captionId: string, voteValue: 1 | -1) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) {
    return { ok: false, error: "Not logged in" };
  }

  const now = new Date().toISOString();

  const { error } = await supabase.from("caption_votes").insert({
    caption_id: captionId,
    profile_id: user.id,
    vote_value: voteValue,
    created_datetime_utc: now, // ✅ REQUIRED in your DB
    // modified_datetime_utc can be null so we don't send it
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/protected");
  return { ok: true };
}