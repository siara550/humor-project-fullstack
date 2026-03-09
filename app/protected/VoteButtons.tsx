"use client";

import { useTransition, useState } from "react";
import { submitVote } from "./actions";

export default function VoteButtons({ captionId }: { captionId: string }) {
  const [isPending, startTransition] = useTransition();
  const [voted, setVoted] = useState<1 | -1 | null>(null);

  const vote = (value: 1 | -1) => {
    if (voted !== null) return;
    startTransition(async () => {
      const res = await submitVote(captionId, value);
      if (!res.ok) alert(res.error);
      else setVoted(value);
    });
  };

  return (
    <div style={{ display: "flex", gap: "0.4rem" }}>
      <button
        onClick={() => vote(1)}
        disabled={isPending || voted !== null}
        style={{
          padding: "0.3rem 0.7rem", borderRadius: "999px", fontSize: "0.72rem",
          fontWeight: 500, border: `1px solid ${voted === 1 ? "#ff4d00" : "rgba(255,255,255,0.12)"}`,
          background: voted === 1 ? "rgba(255,77,0,0.15)" : "transparent",
          color: voted === 1 ? "#ff4d00" : "rgba(240,237,232,0.5)",
          cursor: voted !== null ? "default" : "pointer", transition: "all 0.15s",
          fontFamily: "DM Sans, sans-serif",
        }}
      >
        ↑ {voted === 1 ? "Voted" : "Up"}
      </button>
      <button
        onClick={() => vote(-1)}
        disabled={isPending || voted !== null}
        style={{
          padding: "0.3rem 0.7rem", borderRadius: "999px", fontSize: "0.72rem",
          fontWeight: 500, border: `1px solid ${voted === -1 ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.12)"}`,
          background: voted === -1 ? "rgba(255,255,255,0.08)" : "transparent",
          color: voted === -1 ? "#f0ede8" : "rgba(240,237,232,0.5)",
          cursor: voted !== null ? "default" : "pointer", transition: "all 0.15s",
          fontFamily: "DM Sans, sans-serif",
        }}
      >
        ↓ {voted === -1 ? "Voted" : "Down"}
      </button>
    </div>
  );
}