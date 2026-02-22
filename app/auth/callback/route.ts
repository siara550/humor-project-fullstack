import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.redirect(`${origin}/login?error=missing_code`);
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(`${origin}/login?error=oauth`);
    }

    // after login go to protected feed
    return NextResponse.redirect(`${origin}/protected`);
  } catch (e: any) {
    // If anything crashes, show a readable error instead of blank 500
    return new NextResponse(
      JSON.stringify(
        {
          ok: false,
          where: "/auth/callback",
          message: e?.message ?? String(e),
        },
        null,
        2
      ),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}