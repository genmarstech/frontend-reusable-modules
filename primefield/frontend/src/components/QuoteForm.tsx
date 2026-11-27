"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { byId } from "@/lib/products";
import { toggleQuote, useQuote } from "@/lib/quote";
import { mailtoUrl, whatsappUrl, type QuoteRequest } from "@/lib/quoteRequest";

const labelStyle = { display: "block", font: "500 .82rem/1.2 var(--f-body)", color: "var(--muted)", marginBottom: ".4rem" } as const;

export default function QuoteForm() {
  const quote = useQuote();
  const form = useRef<HTMLFormElement>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Both buttons validate the same way and differ only in where the
  // finished message is handed off. WhatsApp is the submit button because
  // it is where the sales team answers fastest.
  function send(via: "whatsapp" | "email", e?: FormEvent) {
    e?.preventDefault();
    const f = form.current!;
    const v = (name: string) => String(new FormData(f).get(name) ?? "").trim();
    const missing = ["company", "name", "email"].find((n) => !v(n));
    if (missing) {
      setToast("Please add your company, name and email so we can reply.");
      (f.elements.namedItem(missing) as HTMLInputElement).focus();
      return;
    }
    if (!quote.length) {
      setToast("Add at least one product from the catalogue.");
      return;
    }
    const q: QuoteRequest = {
      products: quote, company: v("company"), name: v("name"), email: v("email"),
      port: v("port"), volume: v("volume"), terms: v("terms"), notes: v("notes"),
    };
    const n = quote.length;
    if (via === "whatsapp") {
      window.open(whatsappUrl(q), "_blank", "noopener");
      setToast(`WhatsApp should now be open with your request for ${n} product${n > 1 ? "s" : ""}. Press send there to reach our team.`);
    } else {
      window.location.href = mailtoUrl(q);
      setToast(`Your email app should now be open with your request for ${n} product${n > 1 ? "s" : ""}. Press send there to reach our team.`);
    }
  }

  return (
    <form className="q" ref={form} noValidate onSubmit={(e) => send("whatsapp", e)}>
      <div className="full">
        <span id="picked-label" style={labelStyle}>Products</span>
        <div className="picked" aria-live="polite" aria-labelledby="picked-label">
          {quote.length ? quote.map((id) => {
            const name = byId(id)?.name ?? id;
            return (
              <button key={id} type="button" aria-label={`Remove ${name}`} onClick={() => toggleQuote(id)}>
                {name}<span aria-hidden="true">×</span>
              </button>
            );
          }) : (
            <span className="empty">No products yet. <Link href="/products/">Add them from the catalogue</Link>.</span>
          )}
        </div>
      </div>
      <label>Company<input name="company" autoComplete="organization" required placeholder="e.g. Hamburg Nut Traders GmbH" /></label>
      <label>Your name<input name="name" autoComplete="name" required /></label>
      <label>Email<input name="email" type="email" autoComplete="email" required /></label>
      <label>Destination port<input name="port" placeholder="e.g. Rotterdam, NL" /></label>
      <label>Volume<select name="volume" defaultValue="1 × 20′ container">
        <option>Sample only</option><option>Under 1 tonne</option><option>1 × 20′ container</option><option>1 × 40′ container</option><option>Multiple containers / contract</option>
      </select></label>
      <div><span style={labelStyle}>Shipping terms</span>
        <div className="incoterms" role="radiogroup" aria-label="Shipping terms">
          {["FOB", "CFR", "CIF"].map((t) => (
            <label key={t}><input type="radio" name="terms" value={t} defaultChecked={t === "FOB"} /><span>{t}</span></label>
          ))}
        </div>
      </div>
      <label className="full">Notes<textarea name="notes" placeholder="Grade, packing, delivery window, certificates you need…" /></label>
      <div className="full send">
        <button className="btn btn-gold" type="submit">Send on WhatsApp</button>
        <button className="btn btn-line" type="button" onClick={() => send("email")}>Send by email</button>
      </div>
      <div className="toast" role="status" hidden={!toast}>{toast}</div>
    </form>
  );
}
