import Link from "next/link";
import { COMPANY, DOMAIN, KENYA, TANZANIA, WHATSAPP_URL } from "@/lib/site";

export default function Footer() {
  return (
    <>
      <footer className="site">
        <div className="wrap cols">
          <div>
            <img src="/prime-logo-white.png" alt={COMPANY} width={183} height={44} />
            <p>Exporters of coffee, nuts, spices, pulses, oils and sisal fibre from Kenya and Tanzania to buyers in more than 15 countries.</p>
          </div>
          <div><h4>Products</h4><ul>
            <li><Link href="/products/#nuts">Nuts</Link></li><li><Link href="/products/#coffee">Coffee</Link></li><li><Link href="/products/#spices">Spices</Link></li>
            <li><Link href="/products/#beans-and-pulses">Beans &amp; pulses</Link></li><li><Link href="/products/#sisal-fibre">Sisal fibre</Link></li><li><Link href="/products/">All products</Link></li></ul></div>
          <div><h4>Company</h4><ul>
            <li><Link href="/about/">About us</Link></li><li><Link href="/quality/">Quality</Link></li><li><Link href="/why-us/">Why us</Link></li>
            <li><Link href="/faqs/">FAQs</Link></li><li><Link href="/contact/">Contact</Link></li><li><Link href="/privacy/">Privacy policy</Link></li></ul></div>
          <div><h4>Kenya</h4><ul className="mono">
            <li>{KENYA.phone}</li><li>WhatsApp {KENYA.whatsapp}</li><li>{KENYA.email}</li><li>Mon–Sat {KENYA.hours}</li></ul></div>
          <div><h4>Tanzania</h4><ul className="mono">
            <li>{TANZANIA.shortAddress}</li><li>{TANZANIA.phone}</li><li>{TANZANIA.email}</li><li>Mon–Sat {TANZANIA.hours}</li></ul></div>
        </div>
        <div className="wrap base"><span>© {new Date().getFullYear()} {COMPANY}. All rights reserved.</span><span>{DOMAIN}</span></div>
      </footer>
      <a className="wa" href={WHATSAPP_URL} target="_blank" rel="noopener" aria-label="Chat with us on WhatsApp">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1 2.7c.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.4-.3z" /></svg>
      </a>
    </>
  );
}
