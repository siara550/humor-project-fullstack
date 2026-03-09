import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { supabase as publicSupabase } from "@/lib/supabaseClient";
import VoteButtons from "./VoteButtons";
import LogoutButton from "./LogoutButton";

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

export default async function ProtectedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: captions, error } = await supabase
    .from("captions")
    .select("id, content, created_datetime_utc, image_id")
    .not("image_id", "is", null)
    .order("created_datetime_utc", { ascending: false })
    .limit(30);

  if (error) {
    return <div className="p-6 text-red-400">Error: {error.message}</div>;
  }

  const capRows = (captions ?? []) as CaptionRow[];
  const imageIds = capRows.map((c) => c.image_id!).filter(Boolean);

  const { data: images } = await publicSupabase
    .from("images")
    .select("id, url")
    .in("id", imageIds);

  const imgMap = new Map<string, string>();
  ((images ?? []) as ImageRow[]).forEach((img) => {
    if (img.id && img.url) imgMap.set(img.id, img.url);
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');
        body { background: #080808; margin: 0; }
        .page-wrap { min-height: 100vh; background: #080808; color: #f0ede8; font-family: 'DM Sans', sans-serif; }
        .nav { position: sticky; top: 0; z-index: 50; display: flex; align-items: center; justify-content: space-between; padding: 0 2rem; height: 56px; background: rgba(8,8,8,0.85); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255,255,255,0.07); }
        .nav-logo { font-family: 'Bebas Neue', sans-serif; font-size: 1.6rem; letter-spacing: 0.08em; color: #f0ede8; text-decoration: none; }
        .nav-logo span { color: #ff4d00; }
        .nav-right { display: flex; align-items: center; gap: 0.75rem; }
        .nav-pill { display: inline-flex; align-items: center; padding: 0.35rem 0.9rem; border-radius: 999px; font-size: 0.75rem; font-weight: 500; text-decoration: none; transition: all 0.15s; border: 1px solid rgba(255,255,255,0.12); background: transparent; color: rgba(240,237,232,0.7); cursor: pointer; font-family: 'DM Sans', sans-serif; }
        .nav-pill:hover { background: rgba(255,255,255,0.08); color: #f0ede8; }
        .nav-pill.accent { background: #ff4d00; border-color: #ff4d00; color: #fff; }
        .nav-pill.accent:hover { background: #ff6520; }
        .hero { padding: 4rem 2rem 2rem; max-width: 1200px; margin: 0 auto; }
        .hero-eyebrow { font-size: 0.7rem; letter-spacing: 0.2em; text-transform: uppercase; color: #ff4d00; font-weight: 500; margin-bottom: 0.75rem; }
        .hero-title { font-family: 'Bebas Neue', sans-serif; font-size: clamp(3.5rem, 8vw, 7rem); line-height: 0.92; letter-spacing: 0.02em; color: #f0ede8; margin: 0 0 1rem 0; }
        .hero-title span { color: #ff4d00; }
        .hero-meta { display: flex; align-items: center; gap: 1.5rem; font-size: 0.8rem; color: rgba(240,237,232,0.45); }
        .hero-meta-dot { width: 3px; height: 3px; border-radius: 50%; background: rgba(240,237,232,0.3); }
        .divider { max-width: 1200px; margin: 2rem auto; padding: 0 2rem; border: none; border-top: 1px solid rgba(255,255,255,0.08); }
        .grid-wrap { max-width: 1200px; margin: 0 auto; padding: 0 2rem 6rem; display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.06); }
        .card { background: #0e0e0e; position: relative; overflow: hidden; display: flex; flex-direction: column; transition: background 0.2s; }
        .card:hover { background: #131313; }
        .card-img { position: relative; aspect-ratio: 4/3; overflow: hidden; background: #1a1a1a; }
        .card-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94); display: block; }
        .card:hover .card-img img { transform: scale(1.04); }
        .card-img-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(14,14,14,0.9) 0%, rgba(14,14,14,0.1) 50%, transparent 100%); pointer-events: none; }
        .card-no-img { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 2rem; opacity: 0.2; }
        .card-body { padding: 1.25rem 1.25rem 1rem; flex: 1; display: flex; flex-direction: column; gap: 0.75rem; }
        .card-number { font-family: 'Bebas Neue', sans-serif; font-size: 0.75rem; letter-spacing: 0.15em; color: #ff4d00; opacity: 0.7; }
        .card-caption { font-size: 1.05rem; font-weight: 400; line-height: 1.45; color: #f0ede8; flex: 1; }
        .card-footer { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1.25rem 1.25rem; border-top: 1px solid rgba(255,255,255,0.06); }
        .card-date { font-size: 0.68rem; color: rgba(240,237,232,0.3); letter-spacing: 0.04em; }
      `}</style>

      <div className="page-wrap">
        <nav className="nav">
          <a href="/" className="nav-logo">CRACK<span>D</span></a>
          <div className="nav-right">
            <a href="/list" className="nav-pill">Browse All</a>
            <a href="/upload" className="nav-pill accent">+ Generate</a>
            <LogoutButton />
          </div>
        </nav>

        <div className="hero">
          <p className="hero-eyebrow">Crackd · AI Caption Feed</p>
          <h1 className="hero-title">THE <span>MEME</span><br />FEED</h1>
          <div className="hero-meta">
            <span>{user.email}</span>
            <div className="hero-meta-dot" />
            <span>{capRows.length} captions</span>
            <div className="hero-meta-dot" />
            <span>Vote to contribute to research</span>
          </div>
        </div>

        <hr className="divider" />

        <div className="grid-wrap">
          {capRows.map((c, i) => {
            const imgUrl = c.image_id ? imgMap.get(c.image_id) ?? null : null;
            return (
              <article className="card" key={c.id}>
                <div className="card-img">
                  {imgUrl ? (
                    <>
                      <img src={imgUrl} alt={c.content ?? "caption"} />
                      <div className="card-img-overlay" />
                    </>
                  ) : (
                    <div className="card-no-img">🖼️</div>
                  )}
                </div>
                <div className="card-body">
                  <span className="card-number">{String(i + 1).padStart(2, "0")} —</span>
                  <p className="card-caption">{c.content ?? "(no caption)"}</p>
                </div>
                <div className="card-footer">
                  <span className="card-date">
                    {c.created_datetime_utc
                      ? new Date(c.created_datetime_utc).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                      : "—"}
                  </span>
                  <VoteButtons captionId={c.id} />
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </>
  );
}
