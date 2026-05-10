import { Link } from '@inertiajs/react';
import { User, ArrowUpCircle, Star } from 'lucide-react';
import VehicleBadge from './VehicleBadge';

type PricingRule = {
    rental_unit: 'hourly' | 'daily' | 'weekly' | 'monthly';
    base_rate: number;
};

type Vehicle = {
    id: number;
    brand: string;
    model: string;
    status: string;
    category: {
        name: string;
        pricingRules?: PricingRule[];
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
    bookUrl,
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

    const hourlyPricing = vehicle.category.pricingRules?.find(
        (p) => p.rental_unit === 'hourly',
    );
    const dailyPricing = vehicle.category.pricingRules?.find(
        (p) => p.rental_unit === 'daily',
    );

    // Convert prices (assuming base_rate is in cents/raw value, format it nicely. e.g., $12/hr -> Rp 120.000)
    // For now we'll format it like the design: $12 / hr, $78 / day, but realistically it's Rp.
    // The prompt image uses $. We will use Rupiah as it's an Indonesian app (rent-car).
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
            className="group flex cursor-pointer flex-col rounded-[20px] border border-slate-gray/10 bg-base-white p-4 shadow-sm transition-all hover:border-navy-blue/20 hover:shadow-xl"
        >
            <div className="flex flex-col gap-5 sm:flex-row">
                {/* Image Section (~220x160px) */}
                <div className="relative flex h-[160px] w-full shrink-0 items-center justify-center overflow-hidden rounded-[16px] bg-surface-gray p-2 sm:w-[220px]">
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
                                Popular
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
                                Available
                            </span>
                        </div>

                        <div className="mt-3 flex gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-gold/20 bg-pale-amber px-3 py-1.5 text-[10px] font-bold text-amber-gold shadow-sm">
                                <User className="h-3.5 w-3.5" />+ Professional
                                Driver
                            </span>
                        </div>
                    </div>

                    <div className="mt-5 grid grid-cols-4 gap-2 border-t border-slate-gray/10 pt-4">
                        {/* 4 quick specs columns */}
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold tracking-tighter text-slate-gray uppercase">
                                Seats
                            </span>
                            <span className="text-sm font-extrabold text-navy-blue">
                                4-6
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold tracking-tighter text-slate-gray uppercase">
                                Trans
                            </span>
                            <span className="text-sm font-extrabold text-navy-blue">
                                Auto
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold tracking-tighter text-slate-gray uppercase">
                                Fuel
                            </span>
                            <span className="text-sm font-extrabold text-navy-blue">
                                Petrol
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold tracking-tighter text-slate-gray uppercase">
                                Luggage
                            </span>
                            <span className="text-sm font-extrabold text-navy-blue">
                                2 Bags
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-6 flex items-center justify-between gap-6">
                <div className="flex flex-col">
                    <p className="text-[10px] font-bold text-slate-gray uppercase">
                        Starting from
                    </p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-extrabold text-navy-blue">
                            {dailyPricing
                                ? formatPrice(dailyPricing.base_rate)
                                : hourlyPricing
                                  ? formatPrice(hourlyPricing.base_rate)
                                  : 'TBA'}
                        </span>
                        <span className="text-xs font-bold text-slate-gray">
                            {dailyPricing ? '/day' : hourlyPricing ? '/hr' : ''}
                        </span>
                    </div>
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onClick?.();
                    }}
                    className="flex-1 rounded-full bg-navy-blue py-4 text-center text-sm font-bold text-base-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-navy-blue/90 hover:shadow-lg active:translate-y-0"
                >
                    Book This Vehicle
                </button>
            </div>
        </div>
    );
}
