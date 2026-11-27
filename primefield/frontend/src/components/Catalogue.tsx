"use client";

import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { CATEGORIES, PRODUCTS, catSlug } from "@/lib/products";

const ALL = "All";
const fromHash = () => CATEGORIES.find((c) => catSlug(c) === window.location.hash.slice(1)) ?? ALL;

// The active category lives in the URL hash, so the footer's category links
// and a link pasted into an email both open the catalogue already filtered.
// It is read after mount because a static page has no hash at build time.
export default function Catalogue() {
  const [active, setActive] = useState<string>(ALL);

  useEffect(() => {
    const sync = () => setActive(fromHash());
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  function choose(c: string) {
    setActive(c);
    history.replaceState(null, "", c === ALL ? window.location.pathname : `#${catSlug(c)}`);
  }

  const shown = PRODUCTS.filter((p) => active === ALL || p.cat === active);

  return (
    <>
      <div className="head"><div><div className="eyebrow">Browse by category</div><h2 id="cat-title">{active === ALL ? "All products" : active}</h2></div><p>Prices depend on grade, volume and shipping terms, so we quote each order.</p></div>
      <div className="filters" role="group" aria-label="Filter by category">
        {[ALL, ...CATEGORIES].map((c) => (
          <button key={c} type="button" aria-pressed={c === active} onClick={() => choose(c)}>
            {c}<span className="c">{c === ALL ? PRODUCTS.length : PRODUCTS.filter((p) => p.cat === c).length}</span>
          </button>
        ))}
      </div>
      <div className="grid">{shown.map((p) => <ProductCard key={p.id} p={p} />)}</div>
    </>
  );
}
