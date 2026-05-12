import { Toaster as SonnerToaster, toast as sonnerToast } from 'sonner';
import type { ToasterProps as SonnerToasterProps } from 'sonner';

/**
 * App-wide toast renderer. Mount once at the root (e.g. inside `app.tsx`).
 *
 * @example
 * // app.tsx
 * import { Toaster } from '@/components/ui/toast';
 *
 * createInertiaApp({
 *   setup: ({ App, props }) => (
 *     <>
 *       <App {...props} />
 *       <Toaster />
 *     </>
 *   ),
 * });
 */
export function Toaster(props: SonnerToasterProps) {
    return (
        <SonnerToaster
            position="top-right"
            richColors={false}
            closeButton
            duration={4200}
            gap={12}
            offset={20}
            visibleToasts={4}
            expand
            toastOptions={{
                unstyled: false,
                classNames: {
                    toast: [
                        'group/toast pointer-events-auto relative flex w-full items-start gap-3',
                        'rounded-2xl border border-slate-gray/15 bg-base-white/95 backdrop-blur-md',
                        'px-4 py-3.5 text-sm text-navy-blue',
                        'shadow-[0_10px_40px_-12px_rgba(15,23,42,0.25)]',
                        'data-[type=success]:border-l-4 data-[type=success]:border-l-success-green',
                        'data-[type=error]:border-l-4 data-[type=error]:border-l-red-500',
                        'data-[type=warning]:border-l-4 data-[type=warning]:border-l-amber-gold',
                        'data-[type=info]:border-l-4 data-[type=info]:border-l-navy-blue',
                    ].join(' '),
                    title: 'font-semibold text-navy-blue leading-snug',
                    description: 'text-slate-gray text-[13px] leading-relaxed mt-0.5',
                    actionButton: 'rounded-full bg-navy-blue px-3 py-1.5 text-xs font-semibold text-base-white hover:bg-navy-blue/90',
                    cancelButton: 'rounded-full bg-slate-gray/10 px-3 py-1.5 text-xs font-semibold text-slate-gray hover:bg-slate-gray/20',
                    closeButton:
                        '!bg-transparent !border-none !text-slate-gray hover:!text-navy-blue !top-2 !right-2 !left-auto',
                    icon: 'shrink-0 mt-0.5',
                    success: '!text-success-green',
                    error: '!text-red-500',
                    warning: '!text-amber-gold',
                    info: '!text-navy-blue',
                    loading: '!text-slate-gray',
                },
            }}
            {...props}
        />
    );
}

/**
 * Typed toast helpers. Wraps `sonner`'s API so the app uses a single import.
 *
 * @example
 * import { toast } from '@/components/ui/toast';
 *
 * toast.success('Pesanan tersimpan');
 * toast.error('Gagal menyimpan', { description: 'Periksa koneksi' });
 * toast.promise(saveOrder(), {
 *   loading: 'Menyimpan...',
 *   success: 'Berhasil',
 *   error: 'Gagal',
 * });
 */
export const toast = sonnerToast;

export type { SonnerToasterProps as ToasterProps };
