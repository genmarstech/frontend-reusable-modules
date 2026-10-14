"use client";

import { useActionState } from "react";
import type { User } from "@/lib/types";
import { updateProfile, type ActionState } from "@/app/(storefront)/account/actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/providers/ToastProvider";
import { useEffect, useRef } from "react";

const initialState: ActionState = { error: null };

export function ProfileForm({ user }: { user: User }) {
  const [state, formAction, isPending] = useActionState(updateProfile, initialState);
  const toast = useToast();
  const prevPending = useRef(isPending);

  useEffect(() => {
    if (prevPending.current && !isPending) {
      if (state.error) toast.error(state.error);
      else toast.success("Profile updated.");
    }
    prevPending.current = isPending;
  }, [isPending, state, toast]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Input id="first_name" name="first_name" label="First name" defaultValue={user.first_name} />
        <Input id="last_name" name="last_name" label="Last name" defaultValue={user.last_name} />
      </div>
      <Input id="email" label="Email" defaultValue={user.email} disabled hint="Email can't be changed yet." />
      <Input id="phone_number" name="phone_number" label="Phone number" defaultValue={user.phone_number} />
      <Button type="submit" loading={isPending} className="self-start">
        Save changes
      </Button>
    </form>
  );
}
