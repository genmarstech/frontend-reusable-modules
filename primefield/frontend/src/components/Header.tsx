"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useQuote } from "@/lib/quote";
import { KENYA, TANZANIA } from "@/lib/site";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/about/", label: "About" },
  { href: "/products/", label: "Products" },
  { href: "/quality/", label: "Quality" },
  { href: "/why-us/", label: "Why us" },
  { href: "/contact/", label: "Contact" },
];

function isCurrent(path: string, href: string) {
  return href === "/" ? path === "/" : path.startsWith(href);
}

export default function Header() {
  const path = usePathname();
  const quote = useQuote();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="util" role="complementary" aria-label="Contact">
        <div className="wrap">
          <div className="grp">
            <span>KE <b>{KENYA.phone}</b></span>
            <span className="hide-sm">WhatsApp <b>{KENYA.whatsapp}</b></span>
            <span>TZ <b>{TANZANIA.phone}</b></span>
          </div>
          <div className="grp hide-sm">
            <span><b>{KENYA.email}</b></span>
            <span>Mon–Sat · {KENYA.hours} EAT</span>
          </div>
        </div>
      </div>
      <header className="site">
        <div className="wrap" style={{ position: "relative" }}>
          <Link className="brand" href="/" aria-label="Prime Field Agriculture Limited, home">
            <img src="/prime-logo.png" alt="Prime Field Agriculture Limited" width={192} height={46} />
            <img className="on-dark" src="/prime-logo-white.png" alt="Prime Field Agriculture Limited" width={192} height={46} />
          </Link>
          {/* A client-side navigation does not reload the page, so the mobile
              menu would otherwise stay open over the page it just opened. */}
          <nav className={open ? "main open" : "main"} id="mainnav" aria-label="Main" onClick={() => setOpen(false)}>
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} aria-current={isCurrent(path, n.href) ? "page" : undefined}>
                {n.label}
              </Link>
            ))}
          </nav>
          <Link className="btn btn-gold quote-pill" href="/contact/#quote">
            <span className="lbl">Get a quote</span>
            <span className="lbl-sm" aria-hidden="true">Quote</span>
            <span className="count" hidden={!quote.length}>{quote.length}</span>
          </Link>
          <button
            className="menu-btn"
            aria-expanded={open}
            aria-controls="mainnav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          </button>
        </div>
      </header>
    </>
  );
}
