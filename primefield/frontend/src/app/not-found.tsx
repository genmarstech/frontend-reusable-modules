import Link from "next/link";

export default function NotFound() {
  return (
    <section className="block">
      <div className="wrap prose">
        <div className="eyebrow">Page not found</div>
        <h1>We could not find that page</h1>
        <p>It may have moved when the site was redesigned.</p>
        <p><Link className="btn btn-gold" href="/products/">Browse products</Link></p>
      </div>
    </section>
  );
}
