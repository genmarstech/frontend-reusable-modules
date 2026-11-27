import { useEffect } from "react";
import { pageTitle, SITE } from "./site";

function setMeta(selector: string, attr: "content" | "href", value: string) {
    const el = document.head.querySelector(selector);
    if (el) el.setAttribute(attr, value);
}

/**
 * Sets the tab title, and for public pages the description and social preview text too.
 * Private pages (dashboard, sign in) only need a title.
 */
export function usePageMeta(title?: string, description?: string) {
    useEffect(() => {
        const fullTitle = pageTitle(title);
        document.title = fullTitle;
        const text = description || SITE.description;
        setMeta('meta[name="description"]', "content", text);
        setMeta('meta[property="og:title"]', "content", fullTitle);
        setMeta('meta[property="og:description"]', "content", text);
        setMeta('meta[name="twitter:title"]', "content", fullTitle);
        setMeta('meta[name="twitter:description"]', "content", text);
        const url = SITE.url + window.location.pathname;
        setMeta('meta[property="og:url"]', "content", url);
        setMeta('link[rel="canonical"]', "href", url);
    }, [title, description]);
}
