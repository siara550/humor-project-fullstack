// app/list/page.tsx
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

type CaptionRow = {
  id: string;
  content: string | null;
  created_datetime_utc: string | null;
  image_id: string | null;
};

type ImageRow = {
  id: string;
  url: string | null;
};

export default async function ListPage() {
  // 1) Get captions that actually have an image_id
  const { data: captions, error: capErr } = await supabase
    .from("captions")
    .select("id, content, created_datetime_utc, image_id")
    .not("image_id", "is", null)
    .order("created_datetime_utc", { ascending: false })
    .limit(50);

  if (capErr) {
    return (
      <main className="min-h-screen bg-black text-white p-10">
        <p className="text-red-400">{capErr.message}</p>
      </main>
    );
  }

  const capRows = (captions ?? []) as CaptionRow[];
  const imageIds = capRows.map((c) => c.image_id!).filter(Boolean);

  // 2) Pull images for those ids
  const { data: images, error: imgErr } = await supabase
    .from("images")
    .select("id, url")
    .in("id", imageIds);

  if (imgErr) {
    return (
      <main className="min-h-screen bg-black text-white p-10">
        <p className="text-red-400">{imgErr.message}</p>
      </main>
    );
  }

  // 3) Map image_id -> url
  const imgMap = new Map<string, string>();
  ((images ?? []) as ImageRow[]).forEach((img) => {
    if (img.id && img.url) imgMap.set(img.id, img.url);
  });

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-white/50">Supabase → captions + images</p>
            <h1 className="text-5xl font-semibold tracking-tight">Meme Feed</h1>
            <p className="mt-2 text-white/60">Showing {capRows.length} memes</p>
          </div>

          <Link
            href="/"
            className="rounded-full bg-white/10 px-4 py-2 text-sm hover:bg-white/15"
          >
            Home
          </Link>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {capRows.map((m) => {
            const imgUrl = m.image_id ? imgMap.get(m.image_id) ?? null : null;

            return (
              <article
                key={m.id}
                className="group overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_10px_60px_rgba(0,0,0,0.6)]"
              >
                <div className="relative aspect-[4/3] w-full bg-gradient-to-b from-white/10 to-transparent">
                  {imgUrl ? (
                    <Image
                      src={imgUrl}
                      alt={m.content ?? "meme"}
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-white/40">
                      No image
                    </div>
                  )}

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[11px] text-white/50">
                      {m.created_datetime_utc
                        ? new Date(m.created_datetime_utc).toLocaleString()
                        : "—"}
                    </p>
                    <span className="rounded-full bg-white/10 px-2 py-1 text-[11px] text-white/60">
                      {m.id.slice(0, 6)}
                    </span>
                  </div>

                  <h2 className="mt-3 text-lg font-semibold leading-snug">
                    {m.content ?? "(no caption)"}
                  </h2>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}

