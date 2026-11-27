import type { Metadata } from "next";
import CtaBand from "@/components/CtaBand";
import PageHead from "@/components/PageHead";

// UNCONFIRMED: these answers are drafted, not supplied by the client.
// Minimum order, samples, terms and organic status all need their sign-off.

export const metadata: Metadata = {
  title: "FAQs",
  description: "Answers to common questions about ordering, shipping, payment and quality.",
};

export default function FaqsPage() {
  return (
    <>
      <PageHead img="/img/sacks.jpg" current="FAQs" title="Questions buyers ask us">
        Ordering, shipping, payment and quality. If your question is not here, contact our team.
      </PageHead>
      <section className="block tight">
        <div className="wrap">
          <nav className="toc" aria-label="FAQ sections"><a href="#ordering">Ordering</a><a href="#shipping">Shipping &amp; payment</a><a href="#quality">Quality &amp; documents</a></nav>
          <div className="faq-group" id="ordering"><h2>Ordering</h2><div className="faq"><details open><summary>What is the minimum order?</summary><p>Most products ship by the container, starting at one 20′ container. For some products we can ship smaller volumes or samples. Tell us what you need and we will confirm.</p></details><details><summary>Can I get a sample before I order?</summary><p>Yes. We can send a pre-shipment sample so you can check the grade before you sign a contract. Courier costs are agreed in advance.</p></details><details><summary>How do I get a price?</summary><p>Send a quote request with the products, volumes and destination port. Prices depend on grade, packing and shipping terms, so we quote each order.</p></details><details><summary>Can I combine products in one order?</summary><p>Yes. You can combine products from Kenya and Tanzania. Ask us how to split them across containers.</p></details></div></div><div className="faq-group" id="shipping"><h2>Shipping &amp; payment</h2><div className="faq"><details><summary>Which shipping terms do you offer?</summary><p>We usually ship FOB, CFR or CIF from Mombasa or Dar es Salaam. Other terms can be discussed.</p></details><details><summary>How long does an order take?</summary><p>Lead time depends on the product, the season and the volume. We give you a loading date with your quotation.</p></details><details><summary>Which payment terms do you accept?</summary><p>Payment terms are agreed in the contract before shipment. Ask our sales team for the options available for your order.</p></details><details><summary>Which countries do you ship to?</summary><p>Our products are bought in more than 15 countries. We can ship to any port that accepts the product.</p></details></div></div><div className="faq-group" id="quality"><h2>Quality &amp; documents</h2><div className="faq"><details><summary>Which documents come with a shipment?</summary><p>Usually a certificate of origin, phytosanitary certificate, commercial invoice, packing list and bill of lading. Tell us if your market needs anything else.</p></details><details><summary>Are your products organic?</summary><p>Our macadamia nuts and Hass avocados are sold as organic. Ask us for the current certificates for the product you are buying.</p></details><details><summary>Can you pack under my brand?</summary><p>Yes. We can pack in your chosen bags, cartons or drums and add your labels.</p></details></div></div>
        </div>
      </section>
      <CtaBand title="Still have a question?">Our team answers by phone, email and WhatsApp.</CtaBand>
    </>
  );
}
