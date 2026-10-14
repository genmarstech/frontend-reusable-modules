"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import type { InventoryRecord } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { StockAdjustModal } from "./StockAdjustModal";

export interface InventoryRow {
  record: InventoryRecord;
  label: string;
  sku: string;
}

export function InventoryTable({ rows }: { rows: InventoryRow[] }) {
  const [adjusting, setAdjusting] = useState<InventoryRow | null>(null);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border text-xs text-text-muted">
          <tr>
            <th className="px-5 py-3 font-medium">Item</th>
            <th className="px-5 py-3 font-medium">SKU</th>
            <th className="px-5 py-3 font-medium">Quantity</th>
            <th className="px-5 py-3 font-medium">Threshold</th>
            <th className="px-5 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map(({ record, label, sku }) => (
            <tr key={record.id}>
              <td className="px-5 py-3 font-medium text-text">{label}</td>
              <td className="px-5 py-3 text-text-muted">{sku}</td>
              <td className="px-5 py-3">
                <span className="inline-flex items-center gap-1.5 text-text">
                  {record.is_low_stock && <AlertTriangle className="size-3.5 text-warning" />}
                  {record.quantity}
                </span>
              </td>
              <td className="px-5 py-3 text-text-muted">{record.low_stock_threshold ?? "default"}</td>
              <td className="px-5 py-3 text-right">
                <Button variant="secondary" size="sm" onClick={() => setAdjusting({ record, label, sku })}>
                  Adjust
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {adjusting && <StockAdjustModal record={adjusting.record} label={adjusting.label} onClose={() => setAdjusting(null)} />}
    </div>
  );
}
