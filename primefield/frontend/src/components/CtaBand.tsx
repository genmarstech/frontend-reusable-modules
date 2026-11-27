import Link from "next/link";

export default function CtaBand({ title, children }: { title: string; children: string }) {
  return (
    <section className="block tight"><div className="wrap"><div className="cta-band">
      <div><h2>{title}</h2><p>{children}</p></div>
      <div className="btns"><Link className="btn btn-gold" href="/contact/#quote">Request a quote</Link><Link className="btn btn-line" href="/products/">Browse products</Link></div>
    </div></div></section>
  );
}
