"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { ProductVariant } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import { useToast } from "@/components/providers/ToastProvider";
import { readableErrorMessage } from "@/lib/errors";

export function ProductDetailActions({
  productId,
  basePrice,
  variants,
  outOfStock,
}: {
  productId: number;
  basePrice: string;
  variants: ProductVariant[];
  outOfStock: boolean;
}) {
  const [variantId, setVariantId] = useState<number | undefined>(variants[0]?.id);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const router = useRouter();

  const activeVariant = variants.find((v) => v.id === variantId);
  const price = activeVariant?.price ?? basePrice;

  async function addToCart() {
    setLoading(true);
    try {
      const response = await fetch("/api/proxy/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: productId, variant: variantId ?? null, quantity }),
      });

      if (response.status === 401) {
        router.push(`/login?next=/products/${productId}`);
        return;
      }

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        toast.error(readableErrorMessage(data, "Could not add that to your cart."));
        return;
      }

      toast.success("Added to your cart.");
      router.refresh();
    } catch {
      toast.error("Could not reach the server. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="text-2xl font-semibold text-text">{formatMoney(price)}</p>

      {variants.length > 0 && (
        <Select
          id="variant"
          label={variants[0].name}
          value={variantId}
          onChange={(e) => setVariantId(Number(e.target.value))}
        >
          {variants.map((variant) => (
            <option key={variant.id} value={variant.id}>
              {variant.value}
            </option>
          ))}
        </Select>
      )}

      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-full border border-border">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="size-10 text-lg text-text hover:bg-bg-sunken rounded-full"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="w-8 text-center text-sm">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => q + 1)}
            className="size-10 text-lg text-text hover:bg-bg-sunken rounded-full"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        <Button onClick={addToCart} disabled={outOfStock || loading} size="lg" className="flex-1">
          {loading && <Loader2 className="size-4 animate-spin" />}
          {outOfStock ? "Unavailable" : "Add to cart"}
        </Button>
      </div>
    </div>
  );
}
