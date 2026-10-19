/**
 * Shrinks an oversized product photo to fit this app's own upload limits
 * BEFORE it ever leaves the browser, instead of raising those limits
 * further — see the backend's config/settings.py PRODUCT_IMAGE_MAX_BYTES
 * (5MB) and PRODUCT_IMAGE_MAX_DIMENSION_PX (4000px), and this repo's
 * next.config.ts serverActions.bodySizeLimit. A real phone photo can be
 * 15-20MB and well past 4000px on a side; re-encoding it as a quality JPEG
 * under a sane ceiling turns an upload that would otherwise fail outright
 * into one that just works, without raising limits that exist for real
 * reasons — page weight, storage, and what next/image has to process on
 * every request for that image afterward.
 *
 * The two margins below sit under the real backend limits on purpose, not
 * equal to them: a first-pass JPEG re-encode can land slightly over a byte
 * target, and the multipart request this file rides in also carries the
 * form's other fields (product id, sort_order). If PRODUCT_IMAGE_MAX_BYTES
 * or PRODUCT_IMAGE_MAX_DIMENSION_PX ever change in the backend, these two
 * constants need to move with them.
 */
const MAX_DIMENSION_PX = 3600;
const MAX_BYTES = 4.5 * 1024 * 1024;
const QUALITY_STEPS = [0.92, 0.82, 0.72, 0.6, 0.5] as const;

export interface ResizeResult {
  file: File;
  resized: boolean;
}

/**
 * Returns the original file unchanged whenever it's already within both
 * limits — re-encoding a perfectly fine JPEG as a fresh JPEG only costs
 * quality for nothing. Falls back to the original file (letting the
 * backend's own validator give its real, already-explained error) if the
 * browser can't decode the file as an image, or has no canvas 2D context —
 * this helps the common case; it isn't the only thing standing between a
 * bad upload and a cryptic failure.
 */
export async function resizeImageIfNeeded(file: File): Promise<ResizeResult> {
  if (file.size <= MAX_BYTES) {
    const dimensions = await readDimensions(file);
    if (!dimensions || (dimensions.width <= MAX_DIMENSION_PX && dimensions.height <= MAX_DIMENSION_PX)) {
      return { file, resized: false };
    }
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return { file, resized: false };
  }

  let { width, height } = bitmap;
  if (width > MAX_DIMENSION_PX || height > MAX_DIMENSION_PX) {
    const scale = MAX_DIMENSION_PX / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close?.();
    return { file, resized: false };
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";

  let lastBlob: Blob | null = null;
  for (const quality of QUALITY_STEPS) {
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    lastBlob = blob;
    if (blob && blob.size <= MAX_BYTES) {
      return { file: new File([blob], name, { type: "image/jpeg" }), resized: true };
    }
  }

  // Even the lowest quality step came back over budget — an unusually
  // detailed source image. Hand over that smallest attempt anyway; it's
  // still a better shot at the real limit than the untouched original.
  return lastBlob ? { file: new File([lastBlob], name, { type: "image/jpeg" }), resized: true } : { file, resized: false };
}

async function readDimensions(file: File): Promise<{ width: number; height: number } | null> {
  try {
    const bitmap = await createImageBitmap(file);
    const dimensions = { width: bitmap.width, height: bitmap.height };
    bitmap.close?.();
    return dimensions;
  } catch {
    return null;
  }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
