import { useEffect, useState } from 'react';

type PageLoaderProps = {
    /** Duration in ms before the loader fades out. Defaults to 900ms. */
    duration?: number;
    /** Optional brand label shown beneath the mark. */
    label?: string;
};

/**
 * Minimalist, high-class full-screen loader.
 * - Centered wordmark with a soft gold shimmer sweep
 * - Thin animated progress rail for motion continuity
 * - Fades out gracefully on mount once duration elapses
 * No external deps — Tailwind utilities + custom keyframes declared in app.css.
 */
export default function PageLoader({ duration = 900, label = 'URBAN 8' }: PageLoaderProps) {
    const [visible, setVisible] = useState(true);
    const [fading, setFading] = useState(false);

    useEffect(() => {
        const fadeTimer = window.setTimeout(() => setFading(true), duration);
        const unmountTimer = window.setTimeout(() => setVisible(false), duration + 450);

        return () => {
            window.clearTimeout(fadeTimer);
            window.clearTimeout(unmountTimer);
        };
    }, [duration]);

    if (!visible) {
        return null;
    }

    const [brandFirst, brandAccent] = label.split(' ');

    return (
        <div
            role="status"
            aria-live="polite"
            aria-label="Memuat halaman"
            className={`fixed inset-0 z-[100] grid place-items-center bg-navy-blue transition-opacity duration-500 ease-out ${
                fading ? 'pointer-events-none opacity-0' : 'opacity-100'
            }`}
        >
            <div className="flex flex-col items-center gap-8">
                <div className="relative overflow-hidden">
                    <div className="text-5xl font-extrabold tracking-[0.08em] text-base-white md:text-6xl">
                        <span className="opacity-90">{brandFirst}</span>{' '}
                        <span className="text-amber-gold">{brandAccent ?? ''}</span>
                    </div>
                    <div className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 animate-shimmer-sweep bg-gradient-to-r from-transparent via-base-white/35 to-transparent" />
                </div>

                <div className="relative h-[2px] w-40 overflow-hidden rounded-full bg-base-white/10">
                    <span className="absolute inset-y-0 left-0 w-1/3 animate-loader-rail rounded-full bg-amber-gold" />
                </div>

                <span className="sr-only">Memuat URBAN 8</span>
            </div>
        </div>
    );
}
