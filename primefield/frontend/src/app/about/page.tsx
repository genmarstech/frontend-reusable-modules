import type { Metadata } from "next";
import CtaBand from "@/components/CtaBand";
import Facts from "@/components/Facts";
import PageHead from "@/components/PageHead";

export const metadata: Metadata = {
  title: "About us",
  description: "About Prime Field Agriculture Limited, an agro-export company with offices in Kenya and Tanzania.",
};

export default function AboutPage() {
  return (
    <>
      <PageHead img="/img/farmer.jpg" current="About us" title="Fifteen years of moving East African produce to the world">
        We export and distribute agricultural products from Kenya and Tanzania to wholesalers and distributors in more than 15 countries.
      </PageHead>
      <Facts />
      <section className="block" aria-labelledby="who-h">
        <div className="wrap split">
          <div className="copy">
            <div className="eyebrow">Who we are</div>
            <h2 id="who-h">A reputable exporter with roots at origin</h2>
            <p><strong>Prime Field Agriculture Limited</strong> is a reputable company that exports and distributes agro products. Our main products are organic macadamia nuts, cashew nuts, organic Hass avocado, macadamia oil, avocado oil and sisal fibre.</p>
            <p>Our products are recognised in more than 15 countries around the world. We serve wholesalers and distributors with attractive pricing and packing.</p>
            <p>We give our customers our best because of long-standing relationships with our stakeholders and over 15 years of experience in the industry.</p>
          </div>
          <div className="copy">
            <div className="eyebrow">What we do</div>
            <h2>Quality products for the global export market</h2>
            <p>Our mission has always been to provide high quality products for the global export market. Fair dealing and a commitment to offering only the best have made us a well-known name in agricultural supplies and global export.</p>
            <p>Our focus on export commodities, supplies and trading makes us a strong partner in the export industry. Our knowledge of manufacturing, global exports and logistics means we can handle an order from end to end.</p>
            <p>Our strength is delivering the best quality products on time, at competitive prices, so our customers are satisfied.</p>
          </div>
        </div>
      </section>
      <section className="block tight" aria-label="Photos from origin" style={{ paddingTop: "0" }}>
        <div className="wrap photos">
          <figure><img src="/img/harvest.jpg" alt="Hands holding freshly picked coffee cherries" loading="lazy" /><figcaption>Coffee cherries at harvest</figcaption></figure>
          <figure><img src="/img/green-coffee.jpg" alt="Green coffee beans ready htmlFor export" loading="lazy" /><figcaption>Green coffee, cleaned and graded</figcaption></figure>
          <figure><img src="/img/sisal-bales.jpg" alt="Pressed bales of sisal fibre" loading="lazy" /><figcaption>Sisal fibre in pressed bales</figcaption></figure>
        </div>
      </section>
      <section className="block alt" aria-labelledby="lines-h">
        <div className="wrap">
          <div className="head"><div><div className="eyebrow">Our main lines</div><h2 id="lines-h">What we are known for</h2></div><p>Alongside spices, pulses, grains and sugar, these are the products most of our buyers come to us for.</p></div>
          <div className="cols3">
            <div className="panel"><svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 19c0-9 6-14 15-14 0 9-5 15-14 15"/><path d="M5 19l8-8"/></svg><h3>Organic macadamia nuts</h3><p>Kernels sorted by style and vacuum packed.</p></div>
            <div className="panel"><svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 19c0-9 6-14 15-14 0 9-5 15-14 15"/><path d="M5 19l8-8"/></svg><h3>Cashew nuts</h3><p>Raw kernels graded by size for wholesale and processing.</p></div>
            <div className="panel"><svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 19c0-9 6-14 15-14 0 9-5 15-14 15"/><path d="M5 19l8-8"/></svg><h3>Organic Hass avocado</h3><p>Fresh fruit in cartons, shipped in refrigerated containers.</p></div>
            <div className="panel"><svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 7l9-4 9 4-9 4zM3 7v10l9 4 9-4V7M12 11v10"/></svg><h3>Macadamia &amp; avocado oil</h3><p>Food and cosmetic grade oils in bulk drums or totes.</p></div>
            <div className="panel"><svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 7l9-4 9 4-9 4zM3 7v10l9 4 9-4V7M12 11v10"/></svg><h3>Sisal fibre</h3><p>SSUG and UG grades, pressed into bales for export.</p></div>
            <div className="panel"><svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></svg><h3>Coffee, spices &amp; pulses</h3><p>Arabica and Robusta green coffee, cloves, cardamom, pepper, beans and more.</p></div>
          </div>
        </div>
      </section>
      <section className="block" aria-labelledby="where-h">
        <div className="wrap">
          <div className="head"><div><div className="eyebrow">Where we work</div><h2 id="where-h">Two offices, two export ports</h2></div><p>Our teams in Kenya and Tanzania buy at origin and ship from the region's two main ports.</p></div>
          <div className="cols2">
            <div className="panel"><svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 21s7-6 7-12a7 7 0 0 0-14 0c0 6 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/></svg><h3>Kenya</h3><p>Sales and sourcing for coffee, nuts, avocado and pulses. Exports through the Port of Mombasa.</p><ul><li>+254 782 591065</li><li>sales@primefieldagricultureltd.com</li><li>Mon–Sat 08:00–18:00</li></ul></div>
            <div className="panel"><svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 21s7-6 7-12a7 7 0 0 0-14 0c0 6 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/></svg><h3>Tanzania</h3><p>Mbezi Beach Rd, Kawe, Kinondoni District, Dar es Salaam. Exports through the Port of Dar es Salaam.</p><ul><li>+255 741 423091</li><li>info@primefieldagricultureltd.com</li><li>Mon–Sat 08:00–17:00</li></ul></div>
          </div>
        </div>
      </section>
      <CtaBand title="Ready to talk volumes and prices?">Send us your product list and destination port. We reply with a quotation.</CtaBand>
    </>
  );
}
