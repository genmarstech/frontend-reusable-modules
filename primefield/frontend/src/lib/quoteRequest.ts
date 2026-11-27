import { byId } from "./products";
import { KENYA, WHATSAPP_URL } from "./site";

// How a quote request leaves the site. With no backend, it opens the
// buyer's own WhatsApp or mail app with the request already written, so it
// arrives from them, in a channel the sales team already reads, and nothing
// has to store it on the way.
//
// If the client takes up a backend (../backend), this file is the seam:
// add a function that POSTs `QuoteRequest` and call it from QuoteForm in
// place of these two. Nothing else on the site needs to change.

export type QuoteRequest = {
  products: string[];
  company: string;
  name: string;
  email: string;
  port: string;
  volume: string;
  terms: string;
  notes: string;
};

function message(q: QuoteRequest): string {
  const lines = [
    "Quote request from the website",
    "",
    "Products:",
    ...q.products.map((id) => `- ${byId(id)?.name ?? id}`),
    "",
    `Company: ${q.company}`,
    `Name: ${q.name}`,
    `Email: ${q.email}`,
  ];
  if (q.port) lines.push(`Destination port: ${q.port}`);
  lines.push(`Volume: ${q.volume}`, `Shipping terms: ${q.terms}`);
  if (q.notes) lines.push("", `Notes: ${q.notes}`);
  return lines.join("\n");
}

export const whatsappUrl = (q: QuoteRequest) => `${WHATSAPP_URL}?text=${encodeURIComponent(message(q))}`;

export function mailtoUrl(q: QuoteRequest): string {
  const subject = `Quote request: ${q.company}`;
  return `mailto:${KENYA.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message(q))}`;
}
