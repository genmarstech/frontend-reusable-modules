import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { formatBytes, resizeImageIfNeeded } from "./resize";

function fakeBitmap(width: number, height: number): ImageBitmap {
  return { width, height, close: vi.fn() } as unknown as ImageBitmap;
}

function fakeFile(bytes: number, name = "photo.jpg"): File {
  return new File([new Uint8Array(bytes)], name, { type: "image/jpeg" });
}

/**
 * resize.ts runs in the browser, but this project's vitest config runs
 * unit tests under Node (no jsdom dependency in this repo) — so `document`
 * itself doesn't exist here. Stubbing the one method resize.ts actually
 * calls is simpler than pulling in jsdom for a single file's worth of
 * tests (Charter 03 §I).
 *
 * canvas.toBlob's callback gets a Blob whose size is controlled per call,
 * simulating quality steps converging on (or failing to reach) the limit.
 */
function stubCanvas(blobSizesByQuality: Record<number, number | null>) {
  vi.stubGlobal("document", {
    createElement: (tag: string) => {
      if (tag !== "canvas") throw new Error(`stubCanvas only handles "canvas", got "${tag}"`);
      return {
        width: 0,
        height: 0,
        getContext: () => ({ drawImage: vi.fn() }),
        toBlob: (callback: (blob: Blob | null) => void, _type: string, quality: number) => {
          const size = blobSizesByQuality[quality];
          callback(size === null || size === undefined ? null : new Blob([new Uint8Array(size)], { type: "image/jpeg" }));
        },
      };
    },
  });
}

describe("resizeImageIfNeeded", () => {
  beforeEach(() => {
    vi.stubGlobal("createImageBitmap", vi.fn().mockResolvedValue(fakeBitmap(800, 600)));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("returns a small, already-in-bounds file unchanged", async () => {
    const file = fakeFile(100 * 1024);
    const result = await resizeImageIfNeeded(file);
    expect(result.resized).toBe(false);
    expect(result.file).toBe(file);
  });

  it("re-encodes a file over the byte limit and finds a quality step under budget", async () => {
    stubCanvas({ 0.92: 6 * 1024 * 1024, 0.82: 5 * 1024 * 1024, 0.72: 3 * 1024 * 1024 });
    const file = fakeFile(10 * 1024 * 1024, "huge-phone-photo.heic");

    const result = await resizeImageIfNeeded(file);

    expect(result.resized).toBe(true);
    expect(result.file.size).toBeLessThanOrEqual(3 * 1024 * 1024);
    expect(result.file.type).toBe("image/jpeg");
    expect(result.file.name).toBe("huge-phone-photo.jpg");
  });

  it("re-encodes a file whose dimensions exceed the limit even though its byte size is fine", async () => {
    vi.stubGlobal("createImageBitmap", vi.fn().mockResolvedValue(fakeBitmap(5000, 4000)));
    stubCanvas({ 0.92: 2 * 1024 * 1024 });
    const file = fakeFile(500 * 1024);

    const result = await resizeImageIfNeeded(file);

    expect(result.resized).toBe(true);
  });

  it("hands over the lowest-quality attempt when even that stays over budget", async () => {
    stubCanvas({ 0.92: 6 * 1024 * 1024, 0.82: 6 * 1024 * 1024, 0.72: 6 * 1024 * 1024, 0.6: 6 * 1024 * 1024, 0.5: 5 * 1024 * 1024 });
    const file = fakeFile(10 * 1024 * 1024);

    const result = await resizeImageIfNeeded(file);

    expect(result.resized).toBe(true);
    expect(result.file.size).toBe(5 * 1024 * 1024);
  });

  it("falls back to the original file when the browser can't decode it as an image", async () => {
    vi.stubGlobal("createImageBitmap", vi.fn().mockRejectedValue(new Error("not an image")));
    const file = fakeFile(10 * 1024 * 1024);

    const result = await resizeImageIfNeeded(file);

    expect(result).toEqual({ file, resized: false });
  });
});

describe("formatBytes", () => {
  it("shows kilobytes under 1MB", () => {
    expect(formatBytes(512 * 1024)).toBe("512KB");
  });

  it("shows one decimal place of megabytes at and above 1MB", () => {
    expect(formatBytes(3.2 * 1024 * 1024)).toBe("3.2MB");
  });
});
