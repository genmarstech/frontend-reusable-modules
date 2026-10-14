"use client";

import { useActionState } from "react";
import type { Category, Product } from "@/lib/types";
import type { ActionState } from "@/app/admin/products/actions";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const initialState: ActionState = { error: null };

export function ProductForm({
  product,
  categories,
  action,
}: {
  product?: Product;
  categories: Category[];
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      <Input id="name" name="name" label="Name" defaultValue={product?.name} required />
      <Input id="sku" name="sku" label="SKU" defaultValue={product?.sku} required />
      <Textarea id="description" name="description" label="Description" defaultValue={product?.description} />
      <div className="grid grid-cols-2 gap-3">
        <Input id="price" name="price" label="Price (KES)" type="number" step="0.01" min="0.01" defaultValue={product?.price} required />
        <Select id="status" name="status" label="Status" defaultValue={product?.status ?? "draft"}>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </Select>
      </div>
      <Select id="category" name="category" label="Category" defaultValue={product?.category ?? ""}>
        <option value="">No category</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </Select>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}

      <Button type="submit" loading={isPending} className="self-start">
        {product ? "Save changes" : "Create product"}
      </Button>
    </form>
  );
}
