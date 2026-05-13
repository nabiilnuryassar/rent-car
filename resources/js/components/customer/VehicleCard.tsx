import { Users, Cog, Fuel, Briefcase, ArrowUpCircle, Star, CarFront } from 'lucide-react';
import { formatVehicleStatus } from '@/lib/labels';
import VehicleBadge from './VehicleBadge';

type PricingRule = {
    rental_unit: 'hour' | 'day' | 'week' | 'month';
    base_rate: number;
};

type Vehicle = {
    id: number;
    brand: string;
    model: string;
    status: string;
    category: {
        name: string;
        pricing_rules?: PricingRule[];
    };
    images?: string[];
};

type Props = {
    vehicle: Vehicle;
    onClick?: () => void;
    bookUrl?: string;
    isPopular?: boolean;
    hasFreeUpgrade?: boolean;
};

export default function VehicleCard({
    vehicle,
    onClick,
    isPopular = false,
    hasFreeUpgrade = false,
}: Props) {
    const getVehicleImage = () => {
        if (vehicle.images && vehicle.images.length > 0) {
            return `/storage/${vehicle.images[0]}`;
        }

        const catName = vehicle.category.name.toLowerCase();

        if (catName.includes('sedan')) {
            return '/images/mockup/sedan.png';
        }

        if (catName.includes('mpv') || catName.includes('minibus')) {
            return '/images/mockup/mpv.png';
        }

        if (catName.includes('suv')) {
            return '/images/mockup/suv.png';
        }

        return '/images/mockup/sedan.png'; // fallback
    };

    const hourlyPricing = vehicle.category.pricing_rules?.find(
        (p) => p.rental_unit === 'hour',
    );
    const dailyPricing = vehicle.category.pricing_rules?.find(
        (p) => p.rental_unit === 'day',
    );
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
    };

    return (
        <div
            onClick={onClick}
            className="group flex cursor-pointer flex-col rounded-2xl border border-slate-gray/10 bg-base-white p-4 shadow-sm transition-all hover:border-navy-blue/20 hover:shadow-xl"
        >
            <div className="flex flex-col gap-5 sm:flex-row">
                {/* Image Section (~220x160px) */}
                <div className="relative flex h-[160px] w-full shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-surface-gray p-2 sm:w-[220px]">
                    <img
                        src={getVehicleImage()}
                        alt={`${vehicle.brand} ${vehicle.model}`}
                        className="h-full w-full object-contain drop-shadow-md transition-transform group-hover:scale-105"
                    />
                    <div className="absolute top-2 left-2 flex gap-1">
                        {isPopular && (
                            <VehicleBadge
                                type="popular"
                                icon={<Star className="h-3 w-3" />}
                            >
                                Populer
                            </VehicleBadge>
                        )}
                        {hasFreeUpgrade && (
                            <VehicleBadge
                                type="success"
                                icon={<ArrowUpCircle className="h-3 w-3" />}
                            >
                                Upgrade
                            </VehicleBadge>
                        )}
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex flex-1 flex-col justify-between py-1">
                    <div>
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="mb-1 text-[22px] leading-tight font-extrabold text-navy-blue">
                                    {vehicle.brand} {vehicle.model}
                                </h3>
                                <p className="text-xs font-bold tracking-wider text-slate-gray uppercase">
                                    {vehicle.category.name}
                                </p>
                            </div>
                            <span className="flex items-center gap-1.5 rounded-full bg-navy-blue px-3 py-1 text-[10px] font-bold text-base-white shadow-sm">
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success-green"></span>
                                {formatVehicleStatus(vehicle.status)}
                            </span>
                        </div>

                        <div className="mt-3 flex gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-gold/20 bg-pale-amber px-3 py-1.5 text-[10px] font-bold text-amber-gold shadow-sm">
                                <Users className="h-3.5 w-3.5" />
                                Pengemudi Profesional
                            </span>
                        </div>
                    </div>

                    <div className="mt-5 grid grid-cols-4 gap-2 border-t border-slate-gray/10 pt-4">
                        <div className="flex flex-col items-start gap-1">
                            <Users className="h-4 w-4 text-slate-gray" aria-hidden="true" />
                            <span className="text-[9px] font-bold tracking-tighter text-slate-gray uppercase">
                                Kapasitas
                            </span>
                            <span className="text-sm font-extrabold text-navy-blue">4-6</span>
                        </div>
                        <div className="flex flex-col items-start gap-1">
                            <Cog className="h-4 w-4 text-slate-gray" aria-hidden="true" />
                            <span className="text-[9px] font-bold tracking-tighter text-slate-gray uppercase">
                                Transmisi
                            </span>
                            <span className="text-sm font-extrabold text-navy-blue">Otomatis</span>
                        </div>
                        <div className="flex flex-col items-start gap-1">
                            <Fuel className="h-4 w-4 text-slate-gray" aria-hidden="true" />
                            <span className="text-[9px] font-bold tracking-tighter text-slate-gray uppercase">
                                Bahan Bakar
                            </span>
                            <span className="text-sm font-extrabold text-navy-blue">Bensin</span>
                        </div>
                        <div className="flex flex-col items-start gap-1">
                            <Briefcase className="h-4 w-4 text-slate-gray" aria-hidden="true" />
                            <span className="text-[9px] font-bold tracking-tighter text-slate-gray uppercase">
                                Bagasi
                            </span>
                            <span className="text-sm font-extrabold text-navy-blue">2 Tas</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-6 flex items-center justify-between gap-4">
                <div className="flex flex-col">
                    <p className="text-[10px] font-bold text-slate-gray uppercase">
                        Mulai dari
                    </p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-extrabold text-navy-blue">
                            {dailyPricing
                                ? formatPrice(dailyPricing.base_rate)
                                : hourlyPricing
                                  ? formatPrice(hourlyPricing.base_rate)
                                  : 'Belum tersedia'}
                        </span>
                        <span className="text-xs font-bold text-slate-gray">
                            {dailyPricing ? '/hari' : hourlyPricing ? '/jam' : ''}
                        </span>
                    </div>
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onClick?.();
                    }}
                    aria-label={`Pesan ${vehicle.brand} ${vehicle.model}`}
                    className="flex items-center justify-center gap-2 rounded-full bg-navy-blue px-4 py-3 text-sm font-bold text-base-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-navy-blue/90 hover:shadow-lg active:translate-y-0 sm:flex-1 sm:py-4"
                >
                    <CarFront className="h-4 w-4 sm:hidden" aria-hidden="true" />
                    <span className="hidden sm:inline">Pesan Sekarang</span>
                </button>
            </div>
        </div>
    );
}
