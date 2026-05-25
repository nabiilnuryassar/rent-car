import { router } from '@inertiajs/react';
import { CalendarClock, CarFront, MapPin, UserRound } from 'lucide-react';
import { formatOrderStatus } from '@/lib/labels';
import { vehicleImage } from '@/lib/vehicle-image';

export type FeaturedOrder = {
    id: number;
    order_number: string;
    status: string;
    start_at: string | null;
    end_at: string | null;
    pickup_option: string | null;
    delivery_address: string | null;
    customer?: { user?: { name?: string | null } | null } | null;
    vehicle?: {
        brand?: string | null;
        model?: string | null;
        plate_number?: string | null;
        images?: string[] | null;
        category?: { name?: string | null } | null;
    } | null;
};

type Props = {
    order?: FeaturedOrder | null;
};

function formatSchedule(value: string | null): string {
    if (!value) {
        return 'Jadwal belum ditentukan';
    }

    return new Intl.DateTimeFormat('id-ID', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value));
}

export function ActiveOrderHero({ order }: Props) {
    if (!order) {
        return (
            <section className="mb-6 rounded-[28px] border border-slate-gray/10 bg-base-white p-6 text-center shadow-sm">
                <p className="text-sm font-semibold text-navy-blue">
                    Tidak ada pesanan aktif
                </p>
                <p className="mt-1 text-xs text-slate-gray">
                    Pesanan terbaru akan tampil di sini setelah admin melakukan
                    assignment.
                </p>
            </section>
        );
    }

    const vehicleLabel = [order.vehicle?.brand, order.vehicle?.model]
        .filter(Boolean)
        .join(' ');

    return (
        <section className="mb-6 overflow-hidden rounded-[30px] bg-navy-blue text-base-white shadow-xl">
            <button
                type="button"
                onClick={() => router.visit(`/driver/orders/${order.order_number}`)}
                className="block w-full text-left"
            >
                <div className="relative h-48 overflow-hidden">
                    <img
                        src={vehicleImage(order.vehicle ?? null)}
                        alt="Kendaraan pesanan aktif"
                        className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-navy-blue via-navy-blue/80 to-navy-blue/20" />

                    <div className="absolute inset-0 flex flex-col justify-between p-5">
                        <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-gold px-3 py-1 text-xs font-bold text-navy-blue">
                                <CarFront className="h-3.5 w-3.5" />
                                {formatOrderStatus(order.status)}
                            </span>
                            <span className="font-mono text-xs font-semibold text-base-white/80">
                                {order.order_number}
                            </span>
                        </div>

                        <div>
                            <p className="text-xs font-semibold tracking-wide text-base-white/70 uppercase">
                                Pesanan aktif
                            </p>
                            <h2 className="mt-1 text-2xl font-extrabold">
                                {vehicleLabel || 'Kendaraan Urban8'}
                            </h2>
                            {order.vehicle?.plate_number && (
                                <p className="mt-1 text-sm font-semibold text-base-white/80">
                                    {order.vehicle.plate_number}
                                </p>
                            )}

                            <div className="mt-4 grid gap-2 text-sm text-base-white/90 sm:grid-cols-3">
                                <span className="inline-flex items-center gap-2">
                                    <UserRound className="h-4 w-4 text-amber-gold" />
                                    {order.customer?.user?.name ?? 'Pelanggan'}
                                </span>
                                <span className="inline-flex items-center gap-2">
                                    <CalendarClock className="h-4 w-4 text-amber-gold" />
                                    {formatSchedule(order.start_at)}
                                </span>
                                <span className="inline-flex items-center gap-2 truncate">
                                    <MapPin className="h-4 w-4 shrink-0 text-amber-gold" />
                                    {order.delivery_address ?? 'Detail lokasi tersedia'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="absolute right-5 bottom-5 inline-flex items-center gap-2 rounded-full bg-base-white px-4 py-2 text-sm font-bold text-navy-blue shadow-md">
                        Lihat Detail
                        <CarFront className="h-4 w-4" />
                    </div>
                </div>
            </button>
        </section>
    );
}
