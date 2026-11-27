import type { Metadata } from "next";
import CtaBand from "@/components/CtaBand";
import PageHead from "@/components/PageHead";
import Steps from "@/components/Steps";

// UNCONFIRMED: the checks listed per product type are written from what
// is usual in the trade, not from the client. Confirm each list with them.

export const metadata: Metadata = {
  title: "Quality",
  description: "How Prime Field Agriculture sources, grades, packs and documents every export shipment.",
};

export default function QualityPage() {
  return (
    <>
      <PageHead img="/img/harvest.jpg" current="Quality" title="Quality you can check before it ships">
        Every lot is cleaned, graded and packed to the specification in your contract, and you can see a sample before loading.
      </PageHead>
      <section className="block process" aria-labelledby="proc-h">
        <div className="wrap">
          <div className="head"><div><div className="eyebrow">Our process</div><h2 id="proc-h">Four steps on every order</h2></div><p>The same process applies whether you buy a single container or a season's contract.</p></div>
          <Steps />
        </div>
      </section>
      <section className="block" aria-labelledby="checks-h">
        <div className="wrap">
          <div className="head"><div><div className="eyebrow">What we check</div><h2 id="checks-h">Checks by product type</h2></div><p>Specifications are agreed with you before shipment. These are the points we check most often.</p></div>
          <div className="cols3">
            <div className="panel"><svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg><h3>Coffee</h3><p>Green coffee is checked for bean size, defects and moisture before bagging.</p><ul><li>Screen size and grade</li><li>Defect count</li><li>Moisture content</li><li>Cup sample on request</li></ul></div>
            <div className="panel"><svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg><h3>Nuts</h3><p>Kernels are sorted for size, colour and breakage, then vacuum packed.</p><ul><li>Grade and count</li><li>Broken and scorched kernels</li><li>Moisture content</li><li>Vacuum seal check</li></ul></div>
            <div className="panel"><svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg><h3>Spices &amp; seeds</h3><p>Spices and seeds are cleaned and sorted to remove foreign matter.</p><ul><li>Foreign matter</li><li>Moisture content</li><li>Colour and size</li><li>Oil content (cloves) on request</li></ul></div>
            <div className="panel"><svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg><h3>Beans &amp; pulses</h3><p>Pulses are machine cleaned and sorted by size.</p><ul><li>Foreign matter and splits</li><li>Size grading</li><li>Moisture content</li><li>Insect damage</li></ul></div>
            <div className="panel"><svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg><h3>Sisal fibre</h3><p>Fibre is graded by length, colour and cleanliness, then baled.</p><ul><li>Grade (SSUG, UG)</li><li>Fibre length</li><li>Colour</li><li>Bale weight</li></ul></div>
            <div className="panel"><svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg><h3>Fresh &amp; oils</h3><p>Avocados are checked for size and ripeness; oils for clarity and packing.</p><ul><li>Fruit size count</li><li>Dry matter</li><li>Cold chain (reefer)</li><li>Drum and tote seals</li></ul></div>
          </div>
        </div>
      </section>
      <section className="block tight" aria-label="Photos of our products" style={{ paddingTop: "0" }}>
        <div className="wrap photos">
          <figure><img src="/img/picking.jpg" alt="A worker picking ripe coffee cherries into a basket" loading="lazy" /><figcaption>Selective picking at harvest</figcaption></figure>
          <figure><img src="/img/sacks.jpg" alt="Jute sacks of green coffee in a warehouse" loading="lazy" /><figcaption>Bagged and labelled for export</figcaption></figure>
          <figure><img src="/img/port.jpg" alt="Shipping containers stacked at a port" loading="lazy" /><figcaption>Loaded and shipped by container</figcaption></figure>
        </div>
      </section>
      <section className="block alt" aria-labelledby="pack-h">
        <div className="wrap cols2">
          <div className="panel"><svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 7l9-4 9 4-9 4zM3 7v10l9 4 9-4V7M12 11v10"/></svg><h3 id="pack-h">Packing to your market</h3><p>We pack in jute or PP bags, vacuum packs, cartons, bales, drums or totes, and can add your own labels.</p><ul><li>60 kg jute bags for coffee</li><li>Vacuum packs and cartons for nuts</li><li>25 to 50 kg PP bags for spices and pulses</li><li>Pressed bales for sisal fibre</li></ul></div>
          <div className="panel"><svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/></svg><h3>Documents with every shipment</h3><p>We prepare the export paperwork your buyer and customs need.</p><ul><li>Certificate of origin</li><li>Phytosanitary certificate</li><li>Commercial invoice and packing list</li><li>Bill of lading</li><li>Independent inspection on request</li></ul></div>
        </div>
      </section>
      <CtaBand title="Want to see a sample first?">Ask for a pre-shipment sample with your quote.</CtaBand>
    </>
  );
}
