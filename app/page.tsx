// app/page.tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white p-10">
      <h1 className="text-5xl font-semibold">Hello World</h1>
      <div className="mt-6">
        <Link
          href="/list"
          className="rounded-full bg-white/10 px-4 py-2 hover:bg-white/15"
        >
          Go to Meme Feed →
        </Link>
      </div>
    </main>
  );
}
