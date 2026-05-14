import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ConfirmVariant = 'default' | 'danger';

export type ConfirmOptions = {
    title: string;
    description?: ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: ConfirmVariant;
};

type ConfirmModalProps = ConfirmOptions & {
    open: boolean;
    onConfirm: () => void;
    onCancel: () => void;
};

/**
 * Low-level confirm modal. Prefer the `useConfirm()` hook for imperative use.
 *
 * @example
 * <ConfirmModal
 *   open={open}
 *   title="Hapus pesanan?"
 *   description="Tindakan ini tidak bisa dibatalkan."
 *   variant="danger"
 *   onConfirm={() => setOpen(false)}
 *   onCancel={() => setOpen(false)}
 * />
 */
export function ConfirmModal({
    open,
    title,
    description,
    confirmLabel = 'Lanjutkan',
    cancelLabel = 'Batal',
    variant = 'default',
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    const panelRef = useRef<HTMLDivElement | null>(null);
    const confirmRef = useRef<HTMLButtonElement | null>(null);

    useEffect(() => {
        if (!open) return;
        const prevActive = document.activeElement as HTMLElement | null;
        confirmRef.current?.focus();

        const handleKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                onCancel();
            }
        };
        document.addEventListener('keydown', handleKey);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKey);
            document.body.style.overflow = prevOverflow;
            prevActive?.focus?.();
        };
    }, [open, onCancel]);

    if (!open) return null;

    const isDanger = variant === 'danger';

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
            className="fixed inset-0 z-[200] flex items-center justify-center px-4"
        >
            <button
                type="button"
                aria-label="Tutup"
                onClick={onCancel}
                className="absolute inset-0 animate-backdrop-in bg-navy-blue/55 backdrop-blur-sm"
            />

        <div
                ref={panelRef}
                className="relative w-full max-w-md animate-modal-in overflow-hidden rounded-2xl border border-slate-gray/15 bg-base-white shadow-[0_30px_80px_-20px_rgba(15,23,42,0.35)] max-h-[90dvh] overflow-y-auto"
            >
                <button
                    type="button"
                    onClick={onCancel}
                    aria-label="Tutup"
                    className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full text-slate-gray transition-colors hover:bg-slate-gray/10 hover:text-navy-blue"
                >
                    <X className="h-4 w-4" aria-hidden="true" />
                </button>

                <div className="flex gap-4 px-6 pb-5 pt-7">
                    {isDanger && (
                        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
                            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                        </div>
                    )}
                    <div className="flex-1">
                        <h2
                            id="confirm-modal-title"
                            className="text-lg font-semibold leading-snug text-navy-blue"
                        >
                            {title}
                        </h2>
                        {description && (
                            <div className="mt-2 text-sm leading-relaxed text-slate-gray">
                                {description}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-2 border-t border-slate-gray/10 bg-surface-gray/60 px-6 py-4 sm:flex-row sm:items-center sm:justify-end">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="w-full rounded-full border border-slate-gray/25 bg-base-white px-4 py-3 text-sm font-semibold text-navy-blue transition-colors hover:bg-slate-gray/10 sm:w-auto"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        ref={confirmRef}
                        type="button"
                        onClick={onConfirm}
                        className={cn(
                            'w-full rounded-full px-5 py-3 text-sm font-semibold text-base-white transition-colors sm:w-auto',
                            isDanger
                                ? 'bg-red-500 hover:bg-red-600'
                                : 'bg-navy-blue hover:bg-navy-blue/90',
                        )}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

type ActiveConfirm = {
    options: ConfirmOptions;
    resolve: (value: boolean) => void;
};

/**
 * Provider for the `useConfirm()` hook. Mount once, near the root.
 *
 * @example
 * // layouts/customer-layout.tsx
 * import { ConfirmProvider } from '@/components/ui/confirm-modal';
 *
 * <ConfirmProvider>{children}</ConfirmProvider>
 */
export function ConfirmProvider({ children }: { children: ReactNode }) {
    const [active, setActive] = useState<ActiveConfirm | null>(null);

    const confirm = useCallback<ConfirmFn>((options) => {
        return new Promise<boolean>((resolve) => {
            setActive({ options, resolve });
        });
    }, []);

    const close = useCallback(
        (result: boolean) => {
            if (!active) return;
            active.resolve(result);
            setActive(null);
        },
        [active],
    );

    const value = useMemo(() => confirm, [confirm]);

    return (
        <ConfirmContext.Provider value={value}>
            {children}
            <ConfirmModal
                open={!!active}
                title={active?.options.title ?? ''}
                description={active?.options.description}
                confirmLabel={active?.options.confirmLabel}
                cancelLabel={active?.options.cancelLabel}
                variant={active?.options.variant}
                onConfirm={() => close(true)}
                onCancel={() => close(false)}
            />
        </ConfirmContext.Provider>
    );
}

/**
 * Imperative confirmation dialog. Returns a promise that resolves to a boolean.
 *
 * @example
 * const confirm = useConfirm();
 *
 * async function handleDelete() {
 *   const ok = await confirm({
 *     title: 'Hapus pesanan?',
 *     description: 'Tindakan ini tidak bisa dibatalkan.',
 *     variant: 'danger',
 *     confirmLabel: 'Hapus',
 *   });
 *   if (!ok) return;
 *   await doDelete();
 * }
 */
export function useConfirm(): ConfirmFn {
    const ctx = useContext(ConfirmContext);
    if (!ctx) {
        throw new Error('useConfirm must be used inside <ConfirmProvider>');
    }
    return ctx;
}
