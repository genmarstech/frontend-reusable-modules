"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// What gets revealed as it scrolls into view. Chosen by selector rather
// than marked up page by page, so a new section picks it up for free.
const REVEAL = [
  ".head", ".card", ".panel", ".steps li", ".promise > div", ".fact", ".photos figure",
  ".timeline li", ".faq-group", ".cta-band", ".req > div", ".office", "form.q",
  ".split .copy", ".pd .info", ".pd .media", ".prose", ".home-more",
].join(",");

/** Page-wide behaviour with no markup of its own: scroll reveals, the
 *  header's scrolled state and its measured height, and back to top. */
export default function Motion() {
  const path = usePathname();
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add("js");
    const header = document.querySelector<HTMLElement>("header.site");
    const measure = () => header && document.documentElement.style.setProperty("--header-h", `${header.offsetHeight}px`);
    const onScroll = () => {
      document.documentElement.classList.toggle("scrolled", window.scrollY > 8);
      setShowTop(window.scrollY > 900);
    };
    measure();
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
    };
  }, []);

  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) return;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const el = e.target as HTMLElement;
        io.unobserve(el);
        el.classList.add("in");
        // Hand the element back to its own styles once it has arrived, or
        // the reveal's transform would override hover lifts for good.
        const done = () => el.classList.remove("rv", "in");
        el.addEventListener("transitionend", done, { once: true });
        setTimeout(done, 1200);
      }
    }, { rootMargin: "0px 0px -8% 0px" });

    const arm = (root: ParentNode) => {
      root.querySelectorAll<HTMLElement>(REVEAL).forEach((el) => {
        if (el.dataset.rv) return;
        el.dataset.rv = "1";
        // Already on screen at load: show it, do not make it fade in late.
        if (el.getBoundingClientRect().top < window.innerHeight * 0.9 && !el.closest(".grid")) return;
        // Cards in a swipeable row would otherwise fade in mid-swipe.
        const row = el.parentElement;
        if (row && row.scrollWidth > row.clientWidth + 1) return;
        const siblings = el.parentElement ? [...el.parentElement.children] : [];
        el.style.setProperty("--d", `${Math.min(siblings.indexOf(el), 5) * 70}ms`);
        el.classList.add("rv");
        io.observe(el);
      });
    };
    arm(main);
    // The catalogue swaps its cards when a filter changes; reveal those too.
    const mo = new MutationObserver((recs) => recs.forEach((r) => r.addedNodes.forEach((n) => n instanceof HTMLElement && arm(n.parentElement ?? n))));
    mo.observe(main, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [path]);

  return (
    <button type="button" className={showTop ? "totop show" : "totop"} aria-label="Back to top" tabIndex={showTop ? 0 : -1}
      onClick={() => window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })}>
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 15V5M5 10l5-5 5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </button>
  );
}
