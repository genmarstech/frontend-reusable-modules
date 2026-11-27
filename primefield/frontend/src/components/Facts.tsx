import { PRODUCTS } from "@/lib/products";

export default function Facts() {
  return (
    <section className="facts" aria-label="Company at a glance">
      <div className="wrap">
        <div className="fact"><div className="n">15+</div><div className="l">Years in agro-export</div></div>
        <div className="fact"><div className="n">15+</div><div className="l">Countries buying our produce</div></div>
        <div className="fact"><div className="n">2</div><div className="l">Offices: Kenya and Tanzania</div></div>
        <div className="fact"><div className="n">{PRODUCTS.length}</div><div className="l">Commodities in our catalogue</div></div>
      </div>
    </section>
  );
}
