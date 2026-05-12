import { Loader2 } from 'lucide-react';
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
    [
        'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold',
        'transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-navy-blue/40',
        'disabled:pointer-events-none disabled:opacity-60',
    ].join(' '),
    {
        variants: {
            variant: {
                primary:
                    'bg-navy-blue text-base-white shadow-sm hover:bg-navy-blue/90 active:bg-navy-blue/80',
                accent:
                    'bg-amber-gold text-navy-blue shadow-sm hover:bg-amber-gold/90 active:bg-amber-gold/80',
                outline:
                    'border border-slate-gray/25 bg-base-white text-navy-blue hover:bg-slate-gray/10',
                ghost:
                    'bg-transparent text-navy-blue hover:bg-slate-gray/10',
                danger:
                    'bg-red-500 text-base-white shadow-sm hover:bg-red-600 active:bg-red-700',
            },
            size: {
                sm: 'h-8 px-3 text-xs',
                md: 'h-10 px-5 text-sm',
                lg: 'h-12 px-6 text-base',
                icon: 'h-10 w-10 p-0',
            },
            fullWidth: {
                true: 'w-full',
                false: '',
            },
        },
        defaultVariants: {
            variant: 'primary',
            size: 'md',
            fullWidth: false,
        },
    },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
    VariantProps<typeof buttonVariants> & {
        loading?: boolean;
        leadingIcon?: ReactNode;
        trailingIcon?: ReactNode;
    };

/**
 * Primary shared button with variants, sizes and loading state.
 *
 * @example
 * // Default primary
 * <Button onClick={save}>Simpan</Button>
 *
 * @example
 * // Accent with leading icon
 * <Button variant="accent" leadingIcon={<Sparkles className="h-4 w-4" />}>
 *   Pesan Sekarang
 * </Button>
 *
 * @example
 * // Destructive with loading state
 * <Button variant="danger" loading={deleting} onClick={remove}>
 *   Hapus
 * </Button>
 *
 * @example
 * // Icon-only
 * <Button variant="ghost" size="icon" aria-label="Tutup"><X className="h-5 w-5" /></Button>
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
    {
        className,
        variant,
        size,
        fullWidth,
        loading = false,
        disabled,
        leadingIcon,
        trailingIcon,
        children,
        type = 'button',
        ...rest
    },
    ref,
) {
    const isDisabled = disabled || loading;

    return (
        <button
            ref={ref}
            type={type}
            disabled={isDisabled}
            aria-busy={loading || undefined}
            className={cn(buttonVariants({ variant, size, fullWidth }), className)}
            {...rest}
        >
            {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
                leadingIcon
            )}
            {size !== 'icon' && <span>{children}</span>}
            {!loading && trailingIcon}
        </button>
    );
});

export { buttonVariants };
