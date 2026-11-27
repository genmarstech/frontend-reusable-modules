import type { Metadata } from "next";
import PageHead from "@/components/PageHead";

// UNCONFIRMED: template text, and the visible note at the top says so.
// The client and their legal adviser must review it before launch. It also
// mentions cookies and analytics; this site sets neither today, so either
// add analytics or remove that line, because the policy must be true.

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "Privacy policy for primefieldagricultureltd.com.",
};

export default function PrivacyPage() {
  return (
    <>
      <PageHead img="/img/chickpeas.jpg" current="Privacy policy" title="Privacy policy">
        How we collect and use the information you share with us through this website.
      </PageHead>
      <section className="block tight">
        <div className="wrap prose">
          <p className="legal-note">Template text for the redesign preview. Have the client and their legal adviser review it before it goes live.</p>
          <p>Last updated: November 2026</p>
          <h2>Who we are</h2>
          <p><strong>Prime Field Agriculture Limited</strong> exports and distributes agricultural products from Kenya and Tanzania. This policy explains how we handle personal information collected through www.primefieldagricultureltd.com.</p>
          <h2>Information we collect</h2>
          <ul><li>Details you send us in a quote request or contact form, such as your name, company, email address, phone number and order details.</li><li>Messages you send us by email, phone or WhatsApp.</li><li>Basic technical information such as your browser type and pages visited, collected through cookies and analytics.</li></ul>
          <h2>How we use it</h2>
          <ul><li>To reply to your enquiry and prepare quotations.</li><li>To manage orders, contracts, shipping and payment.</li><li>To meet our legal, tax and export obligations.</li><li>To improve our website.</li></ul>
          <p>We do not sell your personal information.</p>
          <h2>Who we share it with</h2>
          <p>We share information only where needed to fulfil your order or meet legal requirements, for example with shipping lines, freight forwarders, inspection agencies, banks and government authorities.</p>
          <h2>How long we keep it</h2>
          <p>We keep enquiry and order records for as long as needed for the purposes above and to meet legal record-keeping requirements.</p>
          <h2>Your rights</h2>
          <p>You can ask to see, correct or delete the personal information we hold about you, subject to applicable law, including Kenya's Data Protection Act 2019 and Tanzania's Personal Data Protection Act 2022.</p>
          <h2>Contact</h2>
          <p>For privacy questions, email info@primefieldagricultureltd.com or write to PO Box 24211, Mbezi Beach Rd, Kawe, Kinondoni District, Dar es Salaam, Tanzania.</p>
        </div>
      </section>
    </>
  );
}
