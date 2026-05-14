import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PaginationLink } from '@/types/pagination';

type Props = {
    links: PaginationLink[];
    /** Current page — used for the mobile compact display. */
    currentPage?: number;
    /** Total number of pages — used for the mobile compact display. */
    lastPage?: number;
    /** Optional className for the wrapping <nav>. */
    className?: string;
    /** Preserve scroll position when navigating. Defaults to true. */
    preserveScroll?: boolean;
};

/**
 * Decode a Laravel pagination label. Laravel ships HTML entities in the
 * labels (e.g. `&laquo; Previous`), so we need to convert them back to a
 * plain string before inspecting them.
 */
function decodeLabel(label: string): string {
    return label
        .replace(/&laquo;/g, '«')
        .replace(/&raquo;/g, '»')
        .replace(/&hellip;/g, '…')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
}

function isPrevLabel(label: string): boolean {
    const decoded = decodeLabel(label).toLowerCase();
    return decoded.includes('previous') || decoded.includes('sebelumnya') || decoded.includes('«');
}

function isNextLabel(label: string): boolean {
    const decoded = decodeLabel(label).toLowerCase();
    return decoded.includes('next') || decoded.includes('berikutnya') || decoded.includes('»');
}

function isEllipsis(label: string): boolean {
    return decodeLabel(label).includes('...') || decodeLabel(label).includes('…');
}

/**
 * High-class pagination bar that renders Laravel's `links` array.
 *
 * - Active page: navy-blue pill
 * - Inactive pages: white with border, amber-gold hover
 * - Prev / Next buttons: chevron pills with disabled styling when null
 * - Ellipsis gaps render as non-interactive spacers
 * - On mobile only the Prev / current / total / Next layout is shown
 */
export function Pagination({
    links,
    currentPage,
    lastPage,
    className,
    preserveScroll = true,
}: Props) {
    if (!links || links.length <= 3) {
        // Laravel returns [prev, 1, next] when there is a single page — nothing worth rendering.
        return null;
    }

    const prev = links.find((link) => isPrevLabel(link.label));
    const next = links.find((link) => isNextLabel(link.label));
    const pages = links.filter((link) => !isPrevLabel(link.label) && !isNextLabel(link.label));

    // Derive current/last from links when not provided.
    const derivedCurrent =
        currentPage ??
        Number(
            decodeLabel(pages.find((p) => p.active)?.label ?? '').trim() || '1',
        );
    const numericPages = pages
        .map((p) => Number(decodeLabel(p.label).trim()))
        .filter((n) => !Number.isNaN(n));
    const derivedLast = lastPage ?? (numericPages.length > 0 ? Math.max(...numericPages) : 1);

    const baseBtn =
        'inline-flex h-11 min-w-11 items-center justify-center rounded-full text-sm font-bold transition-all select-none';
    const prevNextBase = `${baseBtn} gap-1.5 px-4`;

    return (
        <nav
            aria-label="Pagination"
            className={`mt-10 flex items-center justify-center gap-2 ${className ?? ''}`}
        >
            {/* Desktop / tablet view */}
            <div className="hidden w-full items-center justify-center gap-2 md:flex">
                {prev &&
                    (prev.url ? (
                        <Link
                            href={prev.url}
                            preserveScroll={preserveScroll}
                            className={`${prevNextBase} border border-slate-gray/15 bg-base-white text-navy-blue shadow-sm hover:border-navy-blue/30 hover:bg-surface-gray`}
                            aria-label="Halaman sebelumnya"
                        >
                            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                            Sebelumnya
                        </Link>
                    ) : (
                        <span
                            aria-disabled="true"
                            className={`${prevNextBase} cursor-not-allowed border border-slate-gray/10 bg-base-white/60 text-slate-gray/60 opacity-40`}
                        >
                            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                            Sebelumnya
                        </span>
                    ))}

                <div className="mx-2 flex items-center gap-1.5">
                    {pages.map((link, index) => {
                        if (isEllipsis(link.label)) {
                            return (
                                <span
                                    key={`ellipsis-${index}`}
                                    className="flex h-10 w-10 items-center justify-center text-sm font-semibold text-slate-gray"
                                    aria-hidden="true"
                                >
                                    …
                                </span>
                            );
                        }

                        const label = decodeLabel(link.label);

                        if (link.active) {
                            return (
                                <span
                                    key={`active-${label}-${index}`}
                                    aria-current="page"
                                    className={`${baseBtn} bg-navy-blue text-base-white shadow-md`}
                                >
                                    {label}
                                </span>
                            );
                        }

                        if (!link.url) {
                            return (
                                <span
                                    key={`disabled-${label}-${index}`}
                                    className={`${baseBtn} cursor-not-allowed text-slate-gray/60 opacity-40`}
                                >
                                    {label}
                                </span>
                            );
                        }

                        return (
                            <Link
                                key={`page-${label}-${index}`}
                                href={link.url}
                                preserveScroll={preserveScroll}
                                className={`${baseBtn} border border-slate-gray/15 bg-base-white text-slate-gray hover:border-amber-gold/60 hover:bg-amber-gold/10 hover:text-navy-blue`}
                                aria-label={`Halaman ${label}`}
                            >
                                {label}
                            </Link>
                        );
                    })}
                </div>

                {next &&
                    (next.url ? (
                        <Link
                            href={next.url}
                            preserveScroll={preserveScroll}
                            className={`${prevNextBase} border border-slate-gray/15 bg-base-white text-navy-blue shadow-sm hover:border-navy-blue/30 hover:bg-surface-gray`}
                            aria-label="Halaman berikutnya"
                        >
                            Berikutnya
                            <ChevronRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                    ) : (
                        <span
                            aria-disabled="true"
                            className={`${prevNextBase} cursor-not-allowed border border-slate-gray/10 bg-base-white/60 text-slate-gray/60 opacity-40`}
                        >
                            Berikutnya
                            <ChevronRight className="h-4 w-4" aria-hidden="true" />
                        </span>
                    ))}
            </div>

            {/* Mobile compact view */}
            <div className="flex w-full items-center justify-between gap-3 md:hidden">
                {prev &&
                    (prev.url ? (
                        <Link
                            href={prev.url}
                            preserveScroll={preserveScroll}
                            className={`${prevNextBase} border border-slate-gray/15 bg-base-white text-navy-blue shadow-sm`}
                        >
                            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                            Sebelumnya
                        </Link>
                    ) : (
                        <span
                            aria-disabled="true"
                            className={`${prevNextBase} cursor-not-allowed border border-slate-gray/10 bg-base-white/60 text-slate-gray/60 opacity-40`}
                        >
                            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                            Sebelumnya
                        </span>
                    ))}

                <span className="text-sm font-bold text-navy-blue">
                    {derivedCurrent}{' '}
                    <span className="text-slate-gray">/ {derivedLast}</span>
                </span>

                {next &&
                    (next.url ? (
                        <Link
                            href={next.url}
                            preserveScroll={preserveScroll}
                            className={`${prevNextBase} border border-slate-gray/15 bg-base-white text-navy-blue shadow-sm`}
                        >
                            Berikutnya
                            <ChevronRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                    ) : (
                        <span
                            aria-disabled="true"
                            className={`${prevNextBase} cursor-not-allowed border border-slate-gray/10 bg-base-white/60 text-slate-gray/60 opacity-40`}
                        >
                            Berikutnya
                            <ChevronRight className="h-4 w-4" aria-hidden="true" />
                        </span>
                    ))}
            </div>
        </nav>
    );
}

export default Pagination;
