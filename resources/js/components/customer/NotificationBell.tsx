import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { Bell } from 'lucide-react';
import type { NotificationItem } from '@/types/notification';

type Props = {
    notifications?: NotificationItem[] | null;
};

function formatTime(value: string | null): string {
    if (!value) {
        return '';
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value));
}

export default function NotificationBell({ notifications = [] }: Props) {
    const items = notifications ?? [];
    const unreadCount = items.filter((item) => !item.read).length;

    return (
        <Popover className="relative">
            <PopoverButton
                aria-label="Buka notifikasi"
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-gray/10 bg-base-white text-navy-blue shadow-sm transition hover:-translate-y-0.5 hover:bg-surface-gray hover:shadow-md"
            >
                <Bell className="h-5 w-5" aria-hidden="true" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-5 rounded-full bg-amber-gold px-1.5 py-0.5 text-[10px] font-bold text-navy-blue">
                        {unreadCount}
                    </span>
                )}
            </PopoverButton>

            <PopoverPanel className="absolute right-0 z-30 mt-3 w-80 overflow-hidden rounded-2xl border border-slate-gray/10 bg-base-white shadow-xl">
                <div className="border-b border-slate-gray/10 px-4 py-3">
                    <p className="text-sm font-bold text-navy-blue">
                        Notifikasi
                    </p>
                    <p className="text-xs text-slate-gray">
                        Update pesanan dan pembayaran Anda
                    </p>
                </div>

                {items.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-slate-gray">
                        Belum ada notifikasi.
                    </div>
                ) : (
                    <ul className="max-h-96 overflow-y-auto py-2">
                        {items.map((item) => (
                            <li key={item.id}>
                                <a
                                    href={item.href ?? '#'}
                                    className="block px-4 py-3 transition hover:bg-surface-gray"
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-gold" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-navy-blue">
                                                {item.title}
                                            </p>
                                            {item.body && (
                                                <p className="mt-1 text-xs leading-relaxed text-slate-gray">
                                                    {item.body}
                                                </p>
                                            )}
                                            <p className="mt-2 text-[11px] font-semibold text-slate-gray">
                                                {formatTime(item.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                </a>
                            </li>
                        ))}
                    </ul>
                )}
            </PopoverPanel>
        </Popover>
    );
}
