import { usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { toast } from '@/components/ui/toast';

type FlashBag = {
    success?: string | null;
    error?: string | null;
    warning?: string | null;
    info?: string | null;
};

type PageWithFlash = {
    errors?: Record<string, string>;
    flash?: FlashBag;
};

/**
 * Auto-surface Laravel flash messages via the shared toast renderer.
 *
 * Reads `flash.{success|error|warning|info}` from Inertia page props and
 * dispatches a matching toast exactly once per message. Mount once inside
 * a layout (e.g. admin-layout) and any controller `->with('success', ...)`
 * will show up as an elegant toast without further wiring.
 */
export function useFlashToast() {
    const { errors, flash } = usePage<PageWithFlash>().props;
    const lastKeyRef = useRef<string | null>(null);

    useEffect(() => {
        const { success, error, warning, info } = flash ?? {};
        const validationError = errors ? Object.values(errors)[0] : undefined;
        const entry =
            (success && (['success', success] as const)) ||
            (error && (['error', error] as const)) ||
            (warning && (['warning', warning] as const)) ||
            (validationError && (['error', validationError] as const)) ||
            (info && (['info', info] as const)) ||
            null;

        if (!entry) {
            return;
        }

        const [variant, message] = entry;
        // Dedupe across Inertia partial reloads that keep the same flash
        // payload in props for one extra render cycle.
        const key = `${variant}:${message}`;

        if (lastKeyRef.current === key) {
            return;
        }

        lastKeyRef.current = key;

        switch (variant) {
            case 'success':
                toast.success(message);
                break;
            case 'error':
                toast.error(message);
                break;
            case 'warning':
                toast.warning(message);
                break;
            case 'info':
                toast.info(message);
                break;
        }
    }, [errors, flash]);
}
