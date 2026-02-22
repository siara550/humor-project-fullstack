import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

type CookieToSet = {
  name: string;
  value: string;
  options?: any;
};

export async function createClient() {
  // In your Next version this is async
  const cookieStore = await cookies();

  // ✅ Robust “getAll” that won’t crash even if getAll() is missing
  const safeGetAll = () => {
    const anyStore: any = cookieStore as any;

    // If Next provides getAll(), use it
    if (typeof anyStore.getAll === "function") {
      return anyStore.getAll();
    }

    // If it’s iterable (some Next cookie stores are), convert it
    try {
      if (anyStore[Symbol.iterator]) {
        const arr = [];
        for (const c of anyStore) {
          // c can be [name, value] or {name,value}
          if (Array.isArray(c)) {
            arr.push({ name: c[0], value: c[1]?.value ?? String(c[1]) });
          } else if (c?.name) {
            arr.push({ name: c.name, value: c.value });
          }
        }
        return arr;
      }
    } catch {
      // ignore
    }

    // Worst case: return empty array (won’t crash)
    return [];
  };

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return safeGetAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            try {
              (cookieStore as any).set(name, value, options);
            } catch {
              // Some environments may block setting cookies in certain contexts;
              // but route handlers (like /auth/callback) should be OK.
            }
          });
        },
      },
    }
  );
}