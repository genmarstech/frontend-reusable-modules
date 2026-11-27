import type { Metadata } from "next";
import Catalogue from "@/components/Catalogue";
import CtaBand from "@/components/CtaBand";
import PageHead from "@/components/PageHead";

export const metadata: Metadata = {
  title: "Products",
  description: "Product catalogue: coffee, nuts, spices, beans and pulses, oil seeds, sugar, sisal fibre and oils.",
};

export default function ProductsPage() {
  return (
    <>
      <PageHead img="/img/beans.jpg" current="Products" title="Products we export">
        Twenty commodities from Kenya and Tanzania. Filter by category, open a product for its specification, and add it to your quote.
      </PageHead>
      <section className="block tight" aria-labelledby="cat-title">
        <div className="wrap">
          <Catalogue />
          <div style={{ marginTop: "3rem" }}>
            <div className="eyebrow">Sourced on request</div>
            <div className="req">
              <div><b>Fertilizer</b><span>Ask for current availability</span></div>
              <div><b>Garlic</b><span>Ask for current availability</span></div>
              <div><b>Cooking oil</b><span>Ask for current availability</span></div>
              <div><b>Jute gunny bags</b><span>Ask for current availability</span></div>
            </div>
          </div>
        </div>
      </section>
      <CtaBand title="Cannot find what you need?">We source other East African commodities on request. Tell us the product and volume.</CtaBand>
    </>
  );
}
