"use client";

import { useTransition } from "react";
import { submitVote } from "./actions";

export default function VoteButtons({ captionId }: { captionId: string }) {
  const [isPending, startTransition] = useTransition();

  const vote = (value: 1 | -1) => {
    startTransition(async () => {
      const res = await submitVote(captionId, value);
      if (!res.ok) alert(res.error);
    });
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => vote(1)}
        disabled={isPending}
        className="rounded-lg border border-white/20 px-3 py-1 text-sm hover:bg-white/10 disabled:opacity-50"
      >
        👍 Upvote
      </button>

      <button
        onClick={() => vote(-1)}
        disabled={isPending}
        className="rounded-lg border border-white/20 px-3 py-1 text-sm hover:bg-white/10 disabled:opacity-50"
      >
        👎 Downvote
      </button>
    </div>
  );
}