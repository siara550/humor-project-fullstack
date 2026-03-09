"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/browser";

const API_BASE = "https://api.almostcrackd.ai";

export default function UploadAndCaption() {
  const supabase = createClient();

  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");
  const [captions, setCaptions] = useState<any[]>([]);
  const [imageUrl, setImageUrl] = useState<string>("");

  async function handleGenerate() {
    try {
      setCaptions([]);
      setImageUrl("");
      setStatus("");

      if (!file) throw new Error("Pick an image first.");

      // Get JWT access token from Supabase session
      setStatus("Getting session...");
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;

      const token = data.session?.access_token;
      if (!token) throw new Error("No access token found. Please log in again.");

      // Step 1: Presigned URL
      setStatus("1/4 Generating upload URL...");
      const presignRes = await fetch(`${API_BASE}/pipeline/generate-presigned-url`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ contentType: file.type }),
      });

      if (!presignRes.ok) {
        const text = await presignRes.text();
        throw new Error(`Presign failed (${presignRes.status}): ${text}`);
      }

      const { presignedUrl, cdnUrl } = await presignRes.json();

      // Step 2: Upload bytes to presigned URL (PUT to S3)
      setStatus("2/4 Uploading image...");
      const uploadRes = await fetch(presignedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadRes.ok) {
        const text = await uploadRes.text();
        throw new Error(`Upload failed (${uploadRes.status}): ${text}`);
      }

      // Step 3: Register image URL
      setStatus("3/4 Registering image...");
      const registerRes = await fetch(`${API_BASE}/pipeline/upload-image-from-url`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: cdnUrl,
          isCommonUse: false,
        }),
      });

      if (!registerRes.ok) {
        const text = await registerRes.text();
        throw new Error(`Register failed (${registerRes.status}): ${text}`);
      }

      const { imageId } = await registerRes.json();

      // Step 4: Generate captions
      setStatus("4/4 Generating captions...");
      const captionsRes = await fetch(`${API_BASE}/pipeline/generate-captions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageId }),
      });

      if (!captionsRes.ok) {
        const text = await captionsRes.text();
        throw new Error(`Captions failed (${captionsRes.status}): ${text}`);
      }

      const captionRecords = await captionsRes.json();

      setImageUrl(cdnUrl);
      setCaptions(captionRecords);
      setStatus("Done ✅");
    } catch (e: any) {
      setStatus(`Error: ${e.message ?? "Unknown error"}`);
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 p-5 bg-white/5">
      <h2 className="text-xl font-semibold">Upload an image</h2>
      <p className="mt-1 text-white/70">We’ll generate captions using the AlmostCrackd API.</p>

      <div className="mt-4 flex flex-col gap-3">
        <input
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/heic"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <button
          onClick={handleGenerate}
          className="w-fit rounded-xl bg-white text-black px-4 py-2 font-medium"
        >
          Generate Captions
        </button>

        {status && <div className="text-sm text-white/80">{status}</div>}

        {imageUrl && (
          <img
            src={imageUrl}
            alt="uploaded"
            className="mt-2 w-full max-w-xl rounded-xl border border-white/10"
          />
        )}

        {captions.length > 0 && (
          <div className="mt-2">
            <h3 className="font-semibold">Captions</h3>
            <ol className="mt-2 list-decimal pl-6 space-y-2">
              {captions.map((c, i) => (
                <li key={c.id ?? i} className="text-white/90">
                  {c.caption ?? c.content ?? c.text ?? JSON.stringify(c)}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}