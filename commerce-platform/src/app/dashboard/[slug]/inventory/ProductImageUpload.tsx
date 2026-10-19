"use client";

import { useActionState, useRef, useState } from "react";

import { formatBytes, resizeImageIfNeeded } from "@/lib/images/resize";
import { uploadProductImageAction, type ImageActionResult } from "./actions";

const initialState: ImageActionResult = {};

/**
 * A real phone photo routinely arrives well past this app's own upload
 * limits (see resize.ts's own banner comment) — rather than let that fail
 * at the backend with an error about bytes and dimensions the person
 * choosing a file has no way to judge by eye, this re-encodes an oversized
 * photo down to a size the backend already accepts, the moment it's
 * chosen, before "Add image" is even clicked. A file already within
 * bounds passes through untouched — see resizeImageIfNeeded.
 */
export function ProductImageUpload({ storeSlug, productId }: { storeSlug: string; productId: number }) {
  const [state, formAction, pending] = useActionState(uploadProductImageAction, initialState);
  const [preparing, setPreparing] = useState(false);
  const [resizeNote, setResizeNote] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setResizeNote(null);
    if (!file) return;

    setPreparing(true);
    try {
      const { file: processed, resized } = await resizeImageIfNeeded(file);
      if (resized && fileInputRef.current) {
        // A real <input type="file"> won't accept a File object assigned
        // directly to .files — DataTransfer is the browser's own sanctioned
        // way to hand it a replacement FileList, same technique drag-and-drop
        // uploaders use.
        const transfer = new DataTransfer();
        transfer.items.add(processed);
        fileInputRef.current.files = transfer.files;
        setResizeNote(`Resized from ${formatBytes(file.size)} to ${formatBytes(processed.size)} to fit the upload limit.`);
      }
    } finally {
      setPreparing(false);
    }
  }

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2 text-xs">
      <input type="hidden" name="storeSlug" value={storeSlug} />
      <input type="hidden" name="productId" value={productId} />
      <input
        ref={fileInputRef}
        type="file"
        name="image"
        accept="image/*"
        required
        className="text-xs"
        onChange={handleFileChange}
      />
      <button
        type="submit"
        disabled={pending || preparing}
        className="rounded-md border border-neutral-300 px-2 py-1 font-medium disabled:opacity-50"
      >
        {preparing ? "Preparing…" : pending ? "Uploading…" : "Add image"}
      </button>
      {resizeNote && <span className="text-neutral-500">{resizeNote}</span>}
      {state.error && <span className="text-red-600">{state.error}</span>}
    </form>
  );
}
