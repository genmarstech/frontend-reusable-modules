import Link from "next/link";
import { Fragment, type ReactNode } from "react";

type Crumb = { href: string; label: string };

export default function PageHead({ img, crumbs = [], current, title, children }: {
  img: string;
  crumbs?: Crumb[];
  current: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="pagehead">
      <img src={img} alt="" aria-hidden="true" />
      <div className="wrap">
        <Crumbs crumbs={crumbs} current={current} />
        <h1>{title}</h1>
        <p>{children}</p>
      </div>
    </section>
  );
}

export function Crumbs({ crumbs = [], current }: { crumbs?: Crumb[]; current: string }) {
  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      <Link href="/">Home</Link>
      {crumbs.map((c) => (
        <Fragment key={c.href}>
          <span aria-hidden="true">/</span><Link href={c.href}>{c.label}</Link>
        </Fragment>
      ))}
      <span aria-hidden="true">/</span><span aria-current="page">{current}</span>
    </nav>
  );
}
