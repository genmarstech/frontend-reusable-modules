import type { Metadata } from "next";
import Link from "next/link";
import CtaBand from "@/components/CtaBand";
import PageHead from "@/components/PageHead";

export const metadata: Metadata = {
  title: "Why us",
  description: "Why buyers choose Prime Field Agriculture as their East African supplier.",
};

export default function WhyUsPage() {
  return (
    <>
      <PageHead img="/img/port.jpg" current="Why us" title="One supplier for two origins">
        Buy from Kenya and Tanzania through one team, with clear terms, graded quality and someone to call at every stage.
      </PageHead>
      <section className="block" aria-labelledby="why-h">
        <div className="wrap">
          <div className="head"><div><div className="eyebrow">What you get</div><h2 id="why-h">Reasons buyers stay with us</h2></div><p>Most of our customers have bought from us for several seasons.</p></div>
          <div className="cols3">
            <div className="panel"><svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/><path d="M9 12l2 2 4-4"/></svg><h3>Best quality</h3><p>Lots are cleaned, graded and checked against your specification before packing.</p></div>
            <div className="panel"><svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 12h18M12 3v18"/><circle cx="12" cy="12" r="9"/></svg><h3>Best prices</h3><p>We buy at origin from growers and cooperatives, so wholesale prices stay competitive.</p></div>
            <div className="panel"><svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg><h3>Secure payment</h3><p>Payment terms and shipping terms are written into the contract before anything ships.</p></div>
            <div className="panel"><svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg><h3>Fast shipping</h3><p>We book containers out of Mombasa and Dar es Salaam and keep you updated until arrival.</p></div>
            <div className="panel"><svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg><h3>Support when you need it</h3><p>Reach our team by phone, email or WhatsApp. A named contact follows your order.</p></div>
            <div className="panel"><svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></svg><h3>Two origins, one team</h3><p>Combine products from Kenya and Tanzania with one supplier and one set of paperwork.</p></div>
          </div>
        </div>
      </section>
      <section className="block alt" aria-labelledby="order-h">
        <div className="wrap split" style={{ alignItems: "start" }}>
          <div className="copy">
            <div className="eyebrow">How ordering works</div>
            <h2 id="order-h">From first message to delivery</h2>
            <p>A typical first order follows these steps. Repeat orders are faster because the specification is already agreed.</p>
            <div><Link className="btn btn-gold" href="/contact/#quote">Start with a quote</Link></div>
          </div>
          <ol className="timeline">
            <li><div><h3>Enquiry</h3><p>Tell us the products, volumes and destination port.</p></div></li>
            <li><div><h3>Quotation</h3><p>We send prices, packing options and shipping terms.</p></div></li>
            <li><div><h3>Sample &amp; contract</h3><p>Approve a sample if you need one, then sign the contract.</p></div></li>
            <li><div><h3>Preparation</h3><p>We grade, pack and label your order and prepare the documents.</p></div></li>
            <li><div><h3>Shipment</h3><p>Your container is loaded and you receive the shipping documents.</p></div></li>
          </ol>
        </div>
      </section>
      <CtaBand title="Ready to talk volumes and prices?">Send us your product list and destination port. We reply with a quotation.</CtaBand>
    </>
  );
}
