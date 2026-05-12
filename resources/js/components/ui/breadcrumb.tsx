import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { Fragment } from 'react';
import { cn } from '@/lib/utils';

export type BreadcrumbItem = {
    label: string;
    href?: string;
};

type BreadcrumbProps = {
    items: BreadcrumbItem[];
    className?: string;
    /** Max items to show on mobile before truncation. Default: 2. */
    mobileMax?: number;
};

/**
 * Elegant breadcrumb trail. Accepts an array of `{ label, href }` items; the
 * last item renders as the current page.
 *
 * @example
 * <Breadcrumb
 *   items={[
 *     { label: 'Beranda', href: '/' },
 *     { label: 'Katalog', href: '/catalog' },
 *     { label: 'Toyota Avanza' },
 *   ]}
 * />
 *
 * @remarks
 * On narrow viewports, middle items collapse to an ellipsis to prevent
 * horizontal overflow — only the first and last `mobileMax` items remain
 * visible.
 */
export function Breadcrumb({ items, className, mobileMax = 2 }: BreadcrumbProps) {
    if (items.length === 0) return null;

    const shouldTruncate = items.length > mobileMax + 1;
    const firstItem = items[0];
    const tailItems = shouldTruncate ? items.slice(-mobileMax) : [];

    return (
        <nav
            aria-label="Breadcrumb"
            className={cn('text-sm text-slate-gray', className)}
        >
            {/* Desktop: full trail */}
            <ol className="hidden items-center gap-1.5 sm:flex">
                {items.map((item, i) => {
                    const last = i === items.length - 1;
                    return (
                        <Fragment key={`${item.label}-${i}`}>
                            <li className="flex items-center">
                                <Crumb item={item} isLast={last} />
                            </li>
                            {!last && (
                                <li aria-hidden="true" className="text-slate-gray/40">
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </li>
                            )}
                        </Fragment>
                    );
                })}
            </ol>

            {/* Mobile: truncated */}
            <ol className="flex items-center gap-1.5 sm:hidden">
                {shouldTruncate ? (
                    <>
                        <li className="flex items-center">
                            <Crumb item={firstItem} isLast={false} />
                        </li>
                        <li aria-hidden="true" className="text-slate-gray/40">
                            <ChevronRight className="h-3.5 w-3.5" />
                        </li>
                        <li className="flex items-center text-slate-gray/60">…</li>
                        {tailItems.map((item, i) => {
                            const last = i === tailItems.length - 1;
                            return (
                                <Fragment key={`m-${item.label}-${i}`}>
                                    <li aria-hidden="true" className="text-slate-gray/40">
                                        <ChevronRight className="h-3.5 w-3.5" />
                                    </li>
                                    <li className="flex min-w-0 items-center">
                                        <Crumb item={item} isLast={last} truncate />
                                    </li>
                                </Fragment>
                            );
                        })}
                    </>
                ) : (
                    items.map((item, i) => {
                        const last = i === items.length - 1;
                        return (
                            <Fragment key={`m2-${item.label}-${i}`}>
                                <li className="flex min-w-0 items-center">
                                    <Crumb item={item} isLast={last} truncate />
                                </li>
                                {!last && (
                                    <li aria-hidden="true" className="text-slate-gray/40">
                                        <ChevronRight className="h-3.5 w-3.5" />
                                    </li>
                                )}
                            </Fragment>
                        );
                    })
                )}
            </ol>
        </nav>
    );
}

function Crumb({
    item,
    isLast,
    truncate = false,
}: {
    item: BreadcrumbItem;
    isLast: boolean;
    truncate?: boolean;
}) {
    const baseText = truncate ? 'truncate max-w-[120px]' : '';

    if (isLast || !item.href) {
        return (
            <span
                aria-current={isLast ? 'page' : undefined}
                className={cn(
                    'font-semibold text-navy-blue',
                    baseText,
                )}
            >
                {item.label}
            </span>
        );
    }

    return (
        <Link
            href={item.href}
            className={cn(
                'text-slate-gray transition-colors hover:text-navy-blue',
                baseText,
            )}
        >
            {item.label}
        </Link>
    );
}
