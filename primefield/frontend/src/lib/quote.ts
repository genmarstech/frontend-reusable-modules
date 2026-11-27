"use client";

import { useSyncExternalStore } from "react";
import { byId } from "./products";

// The quote list lives in this browser only. There is no account and no
// server to hold it, and a buyer comparing suppliers should not have to
// sign up to make a list. Reads and writes are wrapped because storage
// throws in some private windows; the list then simply lasts for the visit.
//
// The design preview started with two products already in the list so the
// form had something to show. A real buyer starts with an empty one.

const KEY = "pf-quote";
const listeners = new Set<() => void>();
const EMPTY: string[] = [];
let items: string[] | null = null;

function read(): string[] {
  if (items) return items;
  try {
    const raw = localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    items = Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string" && !!byId(id)) : [];
  } catch {
    items = [];
  }
  return items;
}

function write(next: string[]) {
  items = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    items = null;
    l();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", onStorage);
  };
}

export function toggleQuote(id: string) {
  const cur = read();
  write(cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]);
}

export function useQuote(): string[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}
