"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Check, Loader2 } from "lucide-react";
import clsx from "clsx";
import { useToast } from "@/components/providers/ToastProvider";
import { readableErrorMessage } from "@/lib/errors";

export function AddToCartButton({
  productId,
  variantId,
  disabled,
}: {
  productId: number;
  variantId?: number;
  disabled?: boolean;
}) {
  const [state, setState] = useState<"idle" | "loading" | "added">("idle");
  const toast = useToast();
  const router = useRouter();

  async function addToCart() {
    if (state === "loading") return;
    setState("loading");
    try {
      const response = await fetch("/api/proxy/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: productId, variant: variantId ?? null, quantity: 1 }),
      });

      if (response.status === 401) {
        router.push("/login?next=/cart");
        return;
      }

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        toast.error(readableErrorMessage(data, "Could not add that to your cart."));
        setState("idle");
        return;
      }

      setState("added");
      router.refresh(); // picks up the new cart badge count in the header
      setTimeout(() => setState("idle"), 1500);
    } catch {
      toast.error("Could not reach the server. Try again.");
      setState("idle");
    }
  }

  return (
    <button
      onClick={addToCart}
      disabled={disabled || state === "loading"}
      aria-label="Add to cart"
      className={clsx(
        "inline-flex size-9 items-center justify-center rounded-full shadow-sm transition-colors",
        state === "added" ? "bg-success text-white" : "bg-inverse text-inverse-text hover:opacity-85",
        disabled && "cursor-not-allowed opacity-40",
      )}
    >
      {state === "loading" && <Loader2 className="size-4 animate-spin" />}
      {state === "added" && <Check className="size-4" />}
      {state === "idle" && <Plus className="size-4" />}
    </button>
  );
}
