import { toast } from '@/components/ui/toast';

/**
 * Re-export of the toast API as a hook-style accessor for familiarity.
 * The underlying `toast` from `sonner` is already a stable singleton, so no
 * state is needed. This exists so callsites can opt into whichever style they
 * prefer:
 *
 * @example
 * // Direct import
 * import { toast } from '@/components/ui/toast';
 * toast.success('Done');
 *
 * @example
 * // Hook style
 * import { useToast } from '@/components/ui/use-toast';
 * const { toast } = useToast();
 * toast.error('Oops');
 */
export function useToast() {
    return { toast };
}
