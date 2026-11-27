import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AddToQuote from "@/components/AddToQuote";
import { Crumbs } from "@/components/PageHead";
import ProductCard from "@/components/ProductCard";
import Rail from "@/components/Rail";
import { ORIGIN, PRODUCTS, byId, catSlug, productImage, relatedTo } from "@/lib/products";

// One static page per product. The design preview used a single page that
// read the product from the URL hash; a real page per product gives each
// one its own title and description in search results.
export const dynamicParams = false;

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ id: p.id }));
}

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = byId((await params).id);
  return p ? { title: p.name, description: p.desc } : {};
}

export default async function ProductPage({ params }: Props) {
  const p = byId((await params).id);
  if (!p) notFound();

  // UNCONFIRMED: minimum order, terms and ports are the same for every
  // product here. The client should confirm they hold for all twenty.
  const spec: [string, string][] = [
    ["Product", p.name], ["Category", p.cat], ["HS code", p.hs], ["Origin", ORIGIN], ["Packing", p.pack],
    ["Minimum order", "1 × 20′ container (samples available)"], ["Shipping terms", "FOB · CFR · CIF"], ["Ports of loading", "Mombasa · Dar es Salaam"],
  ];

  return (
    <>
      <section className="pagehead">
        <div className="wrap" style={{ paddingBlock: "1.5rem" }}>
          <Crumbs crumbs={[{ href: "/products/", label: "Products" }, { href: `/products/#${catSlug(p.cat)}`, label: p.cat }]} current={p.name} />
        </div>
      </section>
      <section className="block tight">
        <div className="wrap pd">
          <div className="media">
            <img src={productImage(p)} alt={p.name} />
            <span className="cat">{p.cat}</span>
          </div>
          <div className="info">
            <div className="eyebrow">Export product</div>
            <h1>{p.name}</h1>
            <p className="lede">{p.desc}</p>
            <div className="actions">
              <AddToQuote id={p.id} className="btn btn-line add" />
              <Link className="btn btn-gold" href="/contact/#quote">Request a quote</Link>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="spec"><tbody>
                {spec.map(([k, v]) => <tr key={k}><th scope="row">{k}</th><td>{v}</td></tr>)}
              </tbody></table>
            </div>
            <div><div className="eyebrow" style={{ marginBottom: ".6rem" }}>Export documents available</div>
              <div className="docs"><span>Certificate of origin</span><span>Phytosanitary certificate</span><span>Commercial invoice</span><span>Packing list</span><span>Bill of lading</span></div></div>
          </div>
        </div>
      </section>
      <section className="block tight alt" aria-labelledby="rel-h">
        <div className="wrap">
          <div className="head"><div><div className="eyebrow">You may also need</div><h2 id="rel-h">Related products</h2></div><Link className="btn btn-line" href="/products/">All products</Link></div>
          <Rail count={relatedTo(p).length}>{relatedTo(p).map((r) => <ProductCard key={r.id} p={r} />)}</Rail>
        </div>
      </section>
    </>
  );
}
