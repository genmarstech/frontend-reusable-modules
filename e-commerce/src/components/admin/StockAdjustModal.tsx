"use client";

import { useState, useTransition } from "react";
import type { InventoryRecord } from "@/lib/types";
import { adjustStock } from "@/app/admin/inventory/actions";
import { Modal } from "@/components/ui/Modal";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/providers/ToastProvider";

const REASONS = [
  { value: "restock", label: "Restock" },
  { value: "adjustment", label: "Manual adjustment" },
  { value: "return", label: "Customer return" },
];

export function StockAdjustModal({ record, label, onClose }: { record: InventoryRecord; label: string; onClose: () => void }) {
  const [delta, setDelta] = useState(0);
  const [reason, setReason] = useState("restock");
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  function submit() {
    if (delta === 0) {
      toast.error("Enter a non-zero amount.");
      return;
    }
    startTransition(async () => {
      const result = await adjustStock(record.id, delta, reason, note);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Stock updated.");
        onClose();
      }
    });
  }

  return (
    <Modal open onClose={onClose} title={`Adjust stock — ${label}`}>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-text-muted">Currently {record.quantity} in stock.</p>
        <Input
          id="delta"
          label="Amount (negative to remove)"
          type="number"
          value={delta}
          onChange={(e) => setDelta(Number(e.target.value))}
        />
        <Select id="reason" label="Reason" value={reason} onChange={(e) => setReason(e.target.value)}>
          {REASONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </Select>
        <Input id="note" label="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
        <Button onClick={submit} loading={isPending}>
          Apply
        </Button>
      </div>
    </Modal>
  );
}
