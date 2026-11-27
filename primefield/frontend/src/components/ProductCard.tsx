import Link from "next/link";
import AddToQuote from "./AddToQuote";
import { ORIGIN, productHref, productImage, type Product } from "@/lib/products";

export default function ProductCard({ p }: { p: Product }) {
  return (
    <article className="card">
      <Link className="ph" href={productHref(p)} tabIndex={-1} aria-hidden="true">
        <img src={productImage(p)} alt="" loading="lazy" />
        <span className="cat">{p.cat}</span>
      </Link>
      <div className="body">
        <Link className="title" href={productHref(p)}><h3>{p.name}</h3></Link>
        <dl><dt>HS code</dt><dd>{p.hs}</dd><dt>Packing</dt><dd>{p.pack}</dd><dt>Origin</dt><dd>{ORIGIN}</dd></dl>
        <AddToQuote id={p.id} />
      </div>
    </article>
  );
}
