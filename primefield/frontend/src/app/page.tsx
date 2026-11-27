import Link from "next/link";
import Facts from "@/components/Facts";
import ProductCard from "@/components/ProductCard";
import QuoteSection from "@/components/QuoteSection";
import Steps from "@/components/Steps";
import { FEATURED, PRODUCTS, byId } from "@/lib/products";

export default function HomePage() {
  return (
    <>
      <section className="hero" aria-labelledby="h1">
        <div className="wrap">
          <div>
            <div className="eyebrow">Agro-commodity exporter · Kenya &amp; Tanzania</div>
            <h1 id="h1">East African harvests, <em>graded, packed and shipped</em> to your port.</h1>
            <p className="lede">Prime Field Agriculture supplies green coffee, macadamia and cashew nuts, spices, pulses, oils and sisal fibre to wholesalers and distributors in more than 15 countries.</p>
            <div className="ctas">
              <Link className="btn btn-gold" href="/contact/#quote">Request a quote
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg></Link>
              <Link className="btn btn-ghost" href="/products/">Browse {PRODUCTS.length} products</Link>
            </div>
            <div className="ports">
              <span><b>Mombasa</b>Kenya export port</span>
              <span><b>Dar es Salaam</b>Tanzania export port</span>
              <span><b>FOB · CFR · CIF</b>Shipping terms</span>
            </div>
          </div>
          <div className="visual">
            <img src="/img/hero.jpg" alt="A farmer holding a bucket of freshly picked red coffee cherries" width="1600" height="1067" />
            <div className="stamp" aria-hidden="true">Export<br />Grade</div>
            <div className="tag">
              <div className="eyebrow">Lot spec · Example</div>
              <h3>Arabica Green Coffee</h3>
              <dl>
                <dt>Origin</dt><dd>Kenya</dd>
                <dt>HS code</dt><dd>0901.11</dd>
                <dt>Packing</dt><dd>60 kg jute bags</dd>
                <dt>Load</dt><dd>20′ FCL · ≈19.2 t</dd>
              </dl>
            </div>
          </div>
        </div>
      </section>
      <Facts />
      <section className="block" id="catalogue" aria-labelledby="cat-h">
        <div className="wrap">
          <div className="head">
            <div><div className="eyebrow">Featured products</div><h2 id="cat-h">What we export</h2></div>
            <p>Add products to your quote as you browse. We reply with pricing, packing options and lead times.</p>
          </div>
          <div className="grid">{FEATURED.map((id) => <ProductCard key={id} p={byId(id)!} />)}</div>
          <div className="home-more"><Link className="btn btn-line" href="/products/">See all {PRODUCTS.length} products →</Link></div>
        </div>
      </section>
      <section className="block process" aria-labelledby="proc-h">
        <div className="wrap">
          <div className="head">
            <div><div className="eyebrow">Quality &amp; process</div><h2 id="proc-h">From the farm gate to your warehouse</h2></div>
            <p>Every order follows the same four steps. <Link href="/quality/">See our quality checks</Link>.</p>
          </div>
          <Steps />
        </div>
      </section>
      <section className="block" aria-labelledby="about-h">
        <div className="wrap split">
          <div className="copy">
            <div className="eyebrow">About Prime Field</div>
            <h2 id="about-h">A trading partner built on long relationships</h2>
            <p><strong>Prime Field Agriculture Limited</strong> exports and distributes agro products. Our main lines are organic macadamia nuts, cashew nuts, organic Hass avocado, macadamia oil, avocado oil and sisal fibre.</p>
            <p>Our products are recognised in more than 15 countries. We supply wholesalers and distributors at competitive prices and packing, backed by over 15 years in the industry.</p>
            <div><Link className="btn btn-line" href="/about/">More about us</Link></div>
            <figure className="inline-photo"><img src="/img/farmer.jpg" alt="A farmer tending crops in a green field" loading="lazy" /></figure>
          </div>
          <div className="promise" aria-label="Why buyers choose us">
            <div><svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/><path d="M9 12l2 2 4-4"/></svg><h3>Graded quality</h3><p>Every lot is sorted and checked against the agreed spec before it is packed.</p></div>
            <div><svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 12h18M12 3v18"/><circle cx="12" cy="12" r="9"/></svg><h3>Fair, direct pricing</h3><p>Buying at origin keeps prices competitive for wholesale volumes.</p></div>
            <div><svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg><h3>Secure payment</h3><p>Clear contracts and secure payment terms agreed before shipment.</p></div>
            <div><svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg><h3>On-time shipping</h3><p>A named contact follows your order from loading to arrival.</p></div>
          </div>
        </div>
      </section>
      <QuoteSection title="Tell us what you need and where it ships." />
    </>
  );
}
