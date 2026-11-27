import type { Metadata } from "next";
import Link from "next/link";
import PageHead from "@/components/PageHead";
import QuoteSection from "@/components/QuoteSection";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Prime Field Agriculture in Kenya or Tanzania, or request a quote.",
};

export default function ContactPage() {
  return (
    <>
      <PageHead img="/img/planting.jpg" current="Contact" title="Talk to our team in Kenya or Tanzania">
        Call, email or WhatsApp us, or send a quote request below. We work Monday to Saturday.
      </PageHead>
      <QuoteSection title="Request a quote" />
      <section className="block tight" aria-labelledby="ch-h">
        <div className="wrap">
          <div className="head"><div><div className="eyebrow">Other ways to reach us</div><h2 id="ch-h">Choose what suits you</h2></div></div>
          <div className="cols3">
            <div className="panel"><svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg><h3>WhatsApp</h3><p>Quick questions about stock, prices and samples.</p><ul><li>+254 113 026 558</li></ul></div>
            <div className="panel"><svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/></svg><h3>Email</h3><p>Quotes, contracts and documents.</p><ul><li>sales@primefieldagricultureltd.com</li><li>info@primefieldagricultureltd.com</li></ul></div>
            <div className="panel"><svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 21s7-6 7-12a7 7 0 0 0-14 0c0 6 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/></svg><h3>Visit</h3><p>Tanzania office by appointment.</p><ul><li>Mbezi Beach Rd, Kawe, Kinondoni District, Dar es Salaam</li><li>PO Box 24211</li></ul></div>
          </div>
          <p style={{ marginTop: "1.5rem", color: "var(--muted)" }}>Have a general question? Check our <Link href="/faqs/">FAQs</Link>.</p>
        </div>
      </section>
    </>
  );
}
