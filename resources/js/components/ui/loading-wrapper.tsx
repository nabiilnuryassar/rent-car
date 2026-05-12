import type { ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type LoadingWrapperProps = {
    /** When true, `skeleton` (or the default) is shown instead of `children`. */
    loading: boolean;
    /** Custom skeleton/placeholder. Falls back to a default gradient block. */
    skeleton?: ReactNode;
    /** Delay (ms) before the skeleton appears, avoiding flashes on fast loads. */
    delayMs?: number;
    /** Smooth crossfade between loading and loaded states. Default: true. */
    fade?: boolean;
    className?: string;
    children: ReactNode;
};

/**
 * Wraps any content with a loading/skeleton state. Use preset skeletons or a
 * custom node.
 *
 * @example
 * <LoadingWrapper loading={isLoading} skeleton={<SkeletonTable rows={6} />}>
 *   <OrdersTable data={orders} />
 * </LoadingWrapper>
 *
 * @example
 * // With defaults
 * <LoadingWrapper loading={!vehicle}>
 *   <VehicleDetail vehicle={vehicle!} />
 * </LoadingWrapper>
 */
export function LoadingWrapper({
    loading,
    skeleton,
    delayMs = 120,
    fade = true,
    className,
    children,
}: LoadingWrapperProps) {
    const [showSkeleton, setShowSkeleton] = useDelayedFlag(loading, delayMs);

    // Avoid unused-var warnings (setShowSkeleton is internal)
    void setShowSkeleton;

    if (loading && showSkeleton) {
        return (
            <div
                aria-busy="true"
                aria-live="polite"
                className={cn(fade && 'animate-reveal-fade', className)}
            >
                {skeleton ?? <DefaultSkeleton />}
            </div>
        );
    }

    if (loading && !showSkeleton) {
        // during the debounce window, reserve space but render nothing
        return <div className={className} aria-busy="true" />;
    }

    return (
        <div className={cn(fade && 'animate-reveal-fade', className)}>
            {children}
        </div>
    );
}

function DefaultSkeleton() {
    return (
        <div className="space-y-3">
            <Skeleton height={16} width="45%" />
            <Skeleton height={14} width="80%" />
            <Skeleton height={14} width="70%" />
            <Skeleton height={14} width="55%" />
        </div>
    );
}

// --- internal -------------------------------------------------------------

import { useEffect, useState } from 'react';

function useDelayedFlag(flag: boolean, delayMs: number) {
    const [visible, setVisible] = useState(flag && delayMs === 0);

    useEffect(() => {
        if (!flag) {
            setVisible(false);
            return;
        }
        if (delayMs <= 0) {
            setVisible(true);
            return;
        }
        const id = window.setTimeout(() => setVisible(true), delayMs);
        return () => window.clearTimeout(id);
    }, [flag, delayMs]);

    return [visible, setVisible] as const;
}
