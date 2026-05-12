import type { CSSProperties, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type SkeletonProps = HTMLAttributes<HTMLDivElement> & {
    width?: number | string;
    height?: number | string;
    rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'none';
};

const roundedMap = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    full: 'rounded-full',
} as const;

/**
 * Primitive skeleton block with a shimmer sweep. Used to compose richer preset
 * skeletons or dropped directly into a layout.
 *
 * @example
 * <Skeleton width="60%" height={16} rounded="md" />
 * <Skeleton className="h-24 w-full" rounded="xl" />
 */
export function Skeleton({
    width,
    height,
    rounded = 'md',
    className,
    style,
    ...rest
}: SkeletonProps) {
    const inlineStyle: CSSProperties = {
        width,
        height,
        ...style,
    };

    return (
        <div
            aria-hidden="true"
            className={cn(
                'relative overflow-hidden bg-slate-gray/10',
                roundedMap[rounded],
                'bg-[linear-gradient(90deg,rgba(100,116,139,0.08)_0%,rgba(100,116,139,0.18)_50%,rgba(100,116,139,0.08)_100%)]',
                'bg-[length:200%_100%] animate-shimmer-skeleton',
                className,
            )}
            style={inlineStyle}
            {...rest}
        />
    );
}

/**
 * Card-shaped skeleton preset. Good for grid/list placeholders.
 *
 * @example
 * <div className="grid gap-4 md:grid-cols-3">
 *   {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
 * </div>
 */
export function SkeletonCard({ className }: { className?: string }) {
    return (
        <div
            className={cn(
                'rounded-2xl border border-slate-gray/15 bg-base-white p-5 shadow-sm',
                className,
            )}
        >
            <Skeleton height={160} rounded="xl" className="w-full" />
            <div className="mt-4 space-y-2.5">
                <Skeleton height={14} width="40%" />
                <Skeleton height={18} width="80%" />
                <Skeleton height={12} width="60%" />
            </div>
            <div className="mt-5 flex items-center justify-between">
                <Skeleton height={20} width={80} rounded="full" />
                <Skeleton height={36} width={100} rounded="full" />
            </div>
        </div>
    );
}

/**
 * Table skeleton preset with configurable rows and columns.
 *
 * @example
 * <SkeletonTable rows={6} columns={5} />
 */
export function SkeletonTable({
    rows = 5,
    columns = 4,
    className,
}: {
    rows?: number;
    columns?: number;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'overflow-hidden rounded-2xl border border-slate-gray/15 bg-base-white',
                className,
            )}
        >
            <div className="flex gap-4 border-b border-slate-gray/10 bg-surface-gray/60 px-5 py-3.5">
                {Array.from({ length: columns }).map((_, i) => (
                    <Skeleton key={`h-${i}`} height={12} width="18%" />
                ))}
            </div>
            <div>
                {Array.from({ length: rows }).map((_, r) => (
                    <div
                        key={`r-${r}`}
                        className="flex gap-4 border-b border-slate-gray/5 px-5 py-4 last:border-0"
                    >
                        {Array.from({ length: columns }).map((_, c) => (
                            <Skeleton
                                key={`c-${r}-${c}`}
                                height={14}
                                width={c === 0 ? '22%' : '16%'}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

/**
 * List skeleton preset with avatar + two lines per row.
 *
 * @example
 * <SkeletonList rows={4} />
 */
export function SkeletonList({
    rows = 4,
    className,
}: {
    rows?: number;
    className?: string;
}) {
    return (
        <ul className={cn('space-y-3', className)}>
            {Array.from({ length: rows }).map((_, i) => (
                <li
                    key={i}
                    className="flex items-center gap-4 rounded-2xl border border-slate-gray/10 bg-base-white p-4"
                >
                    <Skeleton height={44} width={44} rounded="full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton height={14} width="55%" />
                        <Skeleton height={12} width="35%" />
                    </div>
                    <Skeleton height={28} width={72} rounded="full" />
                </li>
            ))}
        </ul>
    );
}
