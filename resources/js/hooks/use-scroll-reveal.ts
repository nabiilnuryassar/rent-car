import { useEffect, useRef } from 'react';

type UseScrollRevealOptions = {
    /** Fraction of element visible before firing. Default 0.15. */
    threshold?: number;
    /** Margin shrinks/grows the viewport for earlier/later firing. */
    rootMargin?: string;
    /** Reveal only once (default) or every entry/exit. */
    once?: boolean;
};

/**
 * useScrollReveal
 *
 * Progressive-enhancement hook that adds a `reveal-visible` class to any
 * descendant element tagged with `data-reveal` once it enters the viewport.
 *
 * - Zero dependencies, uses the native IntersectionObserver.
 * - Respects `prefers-reduced-motion` via the CSS utility itself.
 * - Safe for SSR — guards against missing `window` / `IntersectionObserver`.
 */
export function useScrollReveal<T extends HTMLElement = HTMLElement>(
    options: UseScrollRevealOptions = {},
) {
    const { threshold = 0.15, rootMargin = '0px 0px -10% 0px', once = true } = options;
    const containerRef = useRef<T | null>(null);

    useEffect(() => {
        const root = containerRef.current;
        if (!root || typeof window === 'undefined') {
            return;
        }

        const targets = Array.from(
            root.querySelectorAll<HTMLElement>('[data-reveal]'),
        );

        if (targets.length === 0) {
            return;
        }

        // Graceful fallback: no IntersectionObserver → reveal everything.
        if (typeof IntersectionObserver === 'undefined') {
            targets.forEach((el) => el.classList.add('reveal-visible'));
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const el = entry.target as HTMLElement;
                    if (entry.isIntersecting) {
                        el.classList.add('reveal-visible');
                        if (once) {
                            observer.unobserve(el);
                        }
                    } else if (!once) {
                        el.classList.remove('reveal-visible');
                    }
                });
            },
            { threshold, rootMargin },
        );

        targets.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, [threshold, rootMargin, once]);

    return containerRef;
}
