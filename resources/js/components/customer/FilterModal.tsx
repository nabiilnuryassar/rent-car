import { X } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type FilterModalProps = {
    open: boolean;
    onClose: () => void;
    onApply: () => void;
    onReset: () => void;
    title?: string;
    children: ReactNode;
    activeCount?: number;
};

/**
 * Filter modal shell used on the customer catalog.
 *
 * On mobile renders as a full-height bottom drawer; on desktop a centered,
 * rounded-2xl panel with blurred backdrop.
 */
export default function FilterModal({
    open,
    onClose,
    onApply,
    onReset,
    title = 'Filter Kendaraan',
    children,
    activeCount = 0,
}: FilterModalProps) {
    const panelRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!open) {
            return;
        }

        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
            }
        };

        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', handleKey);

        return () => {
            document.removeEventListener('keydown', handleKey);
            document.body.style.overflow = prevOverflow;
        };
    }, [open, onClose]);

    if (!open) {
        return null;
    }

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="filter-modal-title"
            className="fixed inset-0 z-[120] flex items-end justify-center md:items-center md:p-6"
        >
            <button
                type="button"
                aria-label="Tutup filter"
                onClick={onClose}
                className="absolute inset-0 animate-backdrop-in bg-navy-blue/55 backdrop-blur-sm"
            />

            <div
                ref={panelRef}
                className={cn(
                    'relative w-full animate-modal-in overflow-hidden bg-base-white shadow-[0_30px_80px_-20px_rgba(15,23,42,0.35)]',
                    'rounded-t-[28px] md:rounded-2xl',
                    'md:max-w-2xl',
                    'max-h-[92vh] flex flex-col',
                )}
            >
                <div className="flex items-center justify-between border-b border-slate-gray/10 bg-base-white px-6 py-5">
                    <div className="flex items-center gap-2">
                        <h2 id="filter-modal-title" className="text-lg font-bold text-navy-blue">
                            {title}
                        </h2>
                        {activeCount > 0 && (
                            <span className="rounded-full bg-amber-gold px-2 py-0.5 text-[10px] font-bold text-navy-blue">
                                {activeCount} aktif
                            </span>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Tutup"
                        className="rounded-full p-2 text-slate-gray transition-colors hover:bg-slate-gray/10 hover:text-navy-blue"
                    >
                        <X className="h-5 w-5" aria-hidden="true" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>

                <div className="flex items-center justify-between gap-3 border-t border-slate-gray/10 bg-surface-gray/60 px-6 py-4">
                    <button
                        type="button"
                        onClick={onReset}
                        className="rounded-full border border-slate-gray/25 bg-base-white px-5 py-2.5 text-sm font-bold text-slate-gray transition-colors hover:border-navy-blue hover:text-navy-blue"
                    >
                        Reset
                    </button>
                    <button
                        type="button"
                        onClick={onApply}
                        className="flex-1 rounded-full bg-navy-blue px-6 py-2.5 text-sm font-bold text-base-white shadow-md transition-colors hover:bg-navy-blue/90 md:flex-none"
                    >
                        Terapkan Filter
                    </button>
                </div>
            </div>
        </div>
    );
}
