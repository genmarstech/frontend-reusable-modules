"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ProductImagePlaceholder } from "./ProductImagePlaceholder";

/**
 * `ProductImage.image` is confirmed to serialize as a full absolute URL
 * that is NOT actually reachable — `config/urls.py` never wires
 * `django.conf.urls.static.static(...)`, so nothing serves `MEDIA_ROOT`
 * in any environment this project runs in (confirmed live, reproduced
 * with a real uploaded test image — see docs/API_CONTRACT.md). Most
 * products have no image at all and already get `ProductImagePlaceholder`
 * for that; this covers the other case this same bug creates — a product
 * that DOES have an image record, whose URL 404s. Without this, next/image
 * renders the browser's native broken-image icon with alt text next to it,
 * which is not something to ship on a storefront meant to look "clean and
 * professional." `onError` alone isn't enough: the `<img>` is already
 * present in the server-rendered HTML, and this backend's media URL
 * fails fast enough that the browser's native `error` event fires before
 * React finishes hydrating and attaches the listener. A missed `error`
 * event is never replayed, so `onError` alone silently did nothing
 * (confirmed live: the broken-image icon stayed up even though the
 * request to /_next/image had already come back 400). The `ref` + effect
 * below catches that case too: on mount, an already-`complete` image
 * with `naturalWidth === 0` failed before anything could listen for it.
 */
export function ProductImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const el = imgRef.current;
    if (el && el.complete && el.naturalWidth === 0) {
      setFailed(true);
    }
  }, []);

  if (failed) {
    return <ProductImagePlaceholder className={className} />;
  }

  return (
    <Image
      ref={imgRef}
      src={src}
      alt={alt}
      width={600}
      height={600}
      className={className ? `${className} object-cover` : "object-cover"}
      onError={() => setFailed(true)}
    />
  );
}
