import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router";

/**
 * Scroll like a normal website:
 * - a new page starts at the top (or at #anchor when the link has one),
 * - Back and Forward return you to where you were on that page,
 * - focus moves to the new page's main content, so keyboard and screen reader users start there too.
 */
function ScrollManager() {
    const location = useLocation();
    const navigationType = useNavigationType();
    const positions = useRef(new Map<string, number>());
    const firstRender = useRef(true);
    const lastPath = useRef(location.pathname);

    useEffect(() => {
        if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    }, []);

    // Remember how far down each history entry was scrolled. The key lives in a ref that switches
    // the moment a new page commits, so scrolling done for the new page never overwrites the old one.
    const currentKey = useRef(location.key);
    useEffect(() => {
        const save = () => positions.current.set(currentKey.current, window.scrollY);
        window.addEventListener("scroll", save, { passive: true });
        return () => window.removeEventListener("scroll", save);
    }, []);

    useLayoutEffect(() => {
        currentKey.current = location.key;
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }
        // Only a change of page moves the scroll. Filters and ?query changes on the same page do not.
        const samePage = lastPath.current === location.pathname;
        lastPath.current = location.pathname;

        if (navigationType === "POP" && !samePage) {
            const target = positions.current.get(location.key) ?? 0;
            // Lazy pages may still be growing; try for a moment until the spot exists.
            let tries = 0;
            const restore = () => {
                window.scrollTo({ top: target, behavior: "instant" as ScrollBehavior });
                if (Math.abs(window.scrollY - target) > 2 && tries++ < 20) requestAnimationFrame(restore);
            };
            restore();
            return;
        }

        if (samePage && !location.hash) return;

        if (location.hash) {
            const el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
            if (el) {
                el.scrollIntoView({ behavior: "smooth" });
                return;
            }
        }

        window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
        const main = document.getElementById("main");
        main?.focus({ preventScroll: true });
    }, [location.key, location.pathname, location.hash, navigationType]);

    return null;
}

export default ScrollManager;
