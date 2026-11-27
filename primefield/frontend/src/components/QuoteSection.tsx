import CopyButton from "./CopyButton";
import QuoteForm from "./QuoteForm";
import { KENYA, TANZANIA, digits } from "@/lib/site";

// The offices and the quote form, shared by the home page and Contact.
// Only the heading differs between the two.
export default function QuoteSection({ title }: { title: string }) {
  return (
    <section className="block quote" id="quote" aria-labelledby="q-h">
      <div className="wrap grid2">
        <div>
          <div className="eyebrow">Request a quote</div>
          <h2 id="q-h">{title}</h2>
          <p className="intro">Share the products, volumes and destination port. Our team in Kenya or Tanzania will come back with prices, packing and shipping options.</p>
          <div className="offices">
            <div className="office">
              <h3>Kenya <span>{KENYA.hours} EAT</span></h3>
              <p>Prime Field Agriculture Limited, Kenya</p>
              <ul>
                <li><span className="k">Phone</span><span>{KENYA.phone}</span><CopyButton value={digits(KENYA.phone)} /></li>
                <li><span className="k">WhatsApp</span><span>{KENYA.whatsapp}</span><CopyButton value={digits(KENYA.whatsapp)} /></li>
                <li><span className="k">Email</span><span>{KENYA.email}</span><CopyButton value={KENYA.email} /></li>
              </ul>
            </div>
            <div className="office">
              <h3>Tanzania <span>{TANZANIA.hours} EAT</span></h3>
              <p>{TANZANIA.address}</p>
              <ul>
                <li><span className="k">Phone</span><span>{TANZANIA.phone}</span><CopyButton value={digits(TANZANIA.phone)} /></li>
                <li><span className="k">Email</span><span>{TANZANIA.email}</span><CopyButton value={TANZANIA.email} /></li>
              </ul>
              <a className="map-link" href={TANZANIA.mapUrl} target="_blank" rel="noopener">Open in Google Maps ↗</a>
            </div>
          </div>
        </div>
        <QuoteForm />
      </div>
    </section>
  );
}
