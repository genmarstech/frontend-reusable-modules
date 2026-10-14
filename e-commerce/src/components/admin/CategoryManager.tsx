"use client";

import { useActionState, useEffect, useRef, useTransition } from "react";
import { Trash2 } from "lucide-react";
import type { Category } from "@/lib/types";
import { createCategory, deleteCategory, type ActionState } from "@/app/admin/categories/actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/providers/ToastProvider";

const initialState: ActionState = { error: null };

export function CategoryManager({ categories }: { categories: Category[] }) {
  const [state, formAction, isPending] = useActionState(createCategory, initialState);
  const [isDeleting, startTransition] = useTransition();
  const toast = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const prevPending = useRef(isPending);

  useEffect(() => {
    if (prevPending.current && !isPending) {
      if (state.error) toast.error(state.error);
      else formRef.current?.reset();
    }
    prevPending.current = isPending;
  }, [isPending, state, toast]);

  return (
    <div className="flex flex-col gap-6">
      <form ref={formRef} action={formAction} className="flex max-w-sm items-end gap-2">
        <Input id="name" name="name" label="New category" placeholder="e.g. Kitchen" required />
        <Button type="submit" loading={isPending}>
          Add
        </Button>
      </form>

      {categories.length === 0 ? (
        <p className="text-sm text-text-muted">No categories yet.</p>
      ) : (
        <div className="flex flex-col divide-y divide-border rounded-2xl border border-border">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="text-sm font-medium text-text">{category.name}</p>
                <p className="text-xs text-text-muted">/{category.slug}</p>
              </div>
              <button
                onClick={() => startTransition(() => deleteCategory(category.id))}
                disabled={isDeleting}
                className="rounded-full p-2 text-text-muted hover:bg-bg-sunken hover:text-danger"
                aria-label="Delete category"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
