import { Link, usePage, useForm } from '@inertiajs/react';
import {
    X,
    CheckCircle2,
    Users,
    Star,
    ArrowLeft,
    Briefcase,
    Clock,
    Cog,
    Fuel,
    ShoppingCart,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from '@/components/ui/toast';
import { formatVehicleStatus } from '@/lib/labels';
import orders from '@/routes/customer/orders';

type PricingRule = {
    rental_unit: 'hour' | 'day' | 'week' | 'month';
    base_rate: number;
};

type Vehicle = {
    id: number;
    brand: string;
    model: string;
    status: string;
    images?: string[];
    category: {
        id: number;
        name: string;
        pricing_rules?: PricingRule[];
    };
};

type Driver = {
    id: number;
    professional_title: string | null;
    experience_years: number;
    user: { name: string };
};

type Props = {
    vehicle: Vehicle | null;
    isOpen: boolean;
    onClose: () => void;
    rentalUnits?: { value: string; label: string }[];
    pickupOptions?: { value: string; label: string }[];
    drivers?: Driver[];
    isLoyalCustomer?: boolean;
};

type ModalStep = 'detail' | 'booking' | 'driver';

const LANGKAH_LABELS = ['Detail', 'Pemesanan', 'Pengemudi'];

function StepIndicator({ currentStep }: { currentStep: ModalStep }) {
    const stepIndex =
        currentStep === 'detail' ? 0 : currentStep === 'booking' ? 1 : 2;

    return (
        <div className="flex items-center justify-center gap-2 py-4">
            {LANGKAH_LABELS.map((label, i) => (
                <div key={label} className="flex items-center gap-2">
                    <div
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                            i <= stepIndex
                                ? 'bg-navy-blue text-base-white'
                                : 'bg-slate-gray/10 text-slate-gray'
                        }`}
                    >
                        {i < stepIndex ? (
                            <CheckCircle2 className="h-4 w-4" />
                        ) : (
                            i + 1
                        )}
                    </div>
                    <span
                        className={`hidden text-xs font-bold sm:block ${i <= stepIndex ? 'text-navy-blue' : 'text-slate-gray'}`}
                    >
                        {label}
                    </span>
                    {i < LANGKAH_LABELS.length - 1 && (
                        <div
                            className={`h-px w-6 ${i < stepIndex ? 'bg-navy-blue' : 'bg-slate-gray/20'}`}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}

export default function VehicleModal({
    vehicle,
    isOpen,
    onClose,
    rentalUnits = [],
    pickupOptions = [],
    drivers: driversProp = [],
    isLoyalCustomer = false,
}: Props) {
    const { props } = usePage();
    const auth = props.auth as { user?: { name: string } } | undefined;

    const [step, setStep] = useState<ModalStep>('detail');
    const [drivers, setDrivers] = useState<Driver[]>(driversProp);
    const [selectedDriverId, setSelectedDriverId] = useState<number | null>(
        driversProp.length > 0 ? driversProp[0].id : null,
    );

    const { data, setData, post, processing, errors, reset } = useForm({
        vehicle_id: '',
        rental_unit: 'day',
        duration: '',
        start_at: '',
        pickup_option: 'pickup_at_office',
        delivery_address: '',
        is_out_of_town: false,
        driver_id: '',
    });

    const [activeImageIndex, setActiveImageIndex] = useState(0);

    useEffect(() => {
        if (isOpen && vehicle) {
            document.body.style.overflow = 'hidden';
            setData('vehicle_id', vehicle.id.toString());
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setActiveImageIndex(0);
        } else {
            document.body.style.overflow = 'unset';
            setStep('detail');
            setDrivers(driversProp);
            setSelectedDriverId(
                driversProp.length > 0 ? driversProp[0].id : null,
            );
            reset();
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, vehicle]);

    if (!isOpen || !vehicle) {
        return null;
    }

    const getGalleryImages = () => {
        if (vehicle.images && vehicle.images.length > 0) {
            return vehicle.images.map((img) =>
                img.startsWith('http') ? img : `/storage/${img}`,
            );
        }

        const catName = vehicle.category.name.toLowerCase();
        const placeholder = catName.includes('suv')
            ? '/images/mockup/suv.png'
            : catName.includes('mpv') || catName.includes('minibus')
              ? '/images/mockup/mpv.png'
              : '/images/mockup/sedan.png';

        return [placeholder];
    };

    const galleryImages = getGalleryImages();
    const activeImage = galleryImages[activeImageIndex] || galleryImages[0];

    const dailyPricing = vehicle.category.pricing_rules?.find(
        (p) => p.rental_unit === 'day',
    );
    const hourlyPricing = vehicle.category.pricing_rules?.find(
        (p) => p.rental_unit === 'hour',
    );

    const formatPrice = (price: number) =>
        new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);

    const mainPrice = dailyPricing
        ? formatPrice(dailyPricing.base_rate)
        : hourlyPricing
          ? formatPrice(hourlyPricing.base_rate)
          : 'Belum tersedia';
    const unit = dailyPricing ? '/ hari' : hourlyPricing ? '/ jam' : '';

    const goToDriverStep = () => {
        // Minimal client-side guards so we don't advance with an empty form.
        if (!data.duration || !data.start_at) {
            return;
        }

        if (
            data.pickup_option === 'deliver_to_customer' &&
            !data.delivery_address
        ) {
            return;
        }

        setStep('driver');
    };

    const submitBooking = () => {
        if (selectedDriverId) {
            setData('driver_id', selectedDriverId.toString());
        }

        post(orders.store.url(), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Pesanan berhasil dibuat');
            },
            onError: () => {
                toast.error('Gagal membuat pesanan', {
                    description: 'Periksa kembali data pemesanan Anda.',
                });
                // Surface validation errors by sending the user back to the
                // booking step so they can fix the offending field.
                setStep('booking');
            },
        });
    };

    const skipDriverSelection = () => {
        setData('driver_id', '');
        post(orders.store.url(), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Pesanan berhasil dibuat');
            },
            onError: () => {
                toast.error('Gagal membuat pesanan', {
                    description: 'Periksa kembali data pemesanan Anda.',
                });
                setStep('booking');
            },
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div
                className="absolute inset-0 bg-navy-blue/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            <div className="relative flex max-h-[90vh] w-full max-w-[900px] flex-col overflow-hidden overflow-y-auto rounded-[24px] bg-surface-gray shadow-2xl md:flex-row md:overflow-y-visible">
                {/* Area gambar */}
                <div className="flex w-full flex-col gap-4 bg-base-white p-6 md:w-2/5 md:p-8">
                    <StepIndicator currentStep={step} />

                    <div className="flex h-[200px] w-full items-center justify-center overflow-hidden rounded-[16px] bg-surface-gray p-4 md:h-[220px]">
                        <img
                            src={activeImage}
                            alt={`${vehicle.brand} ${vehicle.model}`}
                            className="h-full w-full object-contain drop-shadow-xl"
                        />
                    </div>

                    {galleryImages.length > 1 && (
                        <div className="flex flex-wrap gap-3">
                            {galleryImages.map((img, index) => (
                                <div
                                    key={index}
                                    onClick={() => setActiveImageIndex(index)}
                                    className={`flex h-16 w-16 cursor-pointer items-center justify-center rounded-[12px] border-2 bg-surface-gray p-2 transition-all ${activeImageIndex === index ? 'border-navy-blue' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                >
                                    <img
                                        src={img}
                                        alt={`Pratinjau ${index + 1}`}
                                        className="h-full w-full object-contain"
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {step === 'detail' && (
                        <div className="mt-auto hidden rounded-[16px] border border-slate-gray/10 bg-surface-gray p-4 md:block">
                            <p className="mb-1 text-xs font-medium text-slate-gray">
                                Mulai dari
                            </p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-extrabold text-navy-blue">
                                    {mainPrice}
                                </span>
                                <span className="text-sm font-medium text-slate-gray">
                                    {unit}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Area detail */}
                <div className="flex w-full flex-col bg-surface-gray md:w-3/5">
                    <div className="flex-1 overflow-y-auto p-6 md:p-8">
                        <div className="mb-6 flex items-start justify-between">
                            <div>
                                {step !== 'detail' && (
                                    <button
                                        onClick={() =>
                                            setStep(
                                                step === 'driver'
                                                    ? 'booking'
                                                    : 'detail',
                                            )
                                        }
                                        className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-gray transition-colors hover:text-navy-blue"
                                    >
                                        <ArrowLeft className="h-4 w-4" />{' '}
                                        Kembali
                                    </button>
                                )}
                                <p className="mb-1 text-sm font-medium text-slate-gray">
                                    {vehicle.category.name}
                                </p>
                                <h2 className="text-[28px] leading-tight font-bold text-navy-blue">
                                    {vehicle.brand} {vehicle.model}
                                </h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-gray/10 text-slate-gray transition-colors hover:bg-slate-gray/20 hover:text-navy-blue"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {step === 'detail' && (
                            <>
                                <div className="mb-6 flex items-center gap-2">
                                    <div className="flex items-center gap-1 text-xs font-bold text-navy-blue">
                                        <Star className="h-4 w-4 fill-amber-gold text-amber-gold" />{' '}
                                        4,9 (120+ perjalanan)
                                    </div>
                                    <span className="text-slate-gray/30">
                                        /
                                    </span>
                                    <div className="flex items-center gap-1 text-xs font-bold text-success-green">
                                        <span className="h-1.5 w-1.5 rounded-full bg-success-green"></span>
                                        {formatVehicleStatus(vehicle.status)}
                                    </div>
                                </div>

                                <div className="mb-8 grid grid-cols-4 gap-3">
                                    <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-gray/10 bg-base-white p-3">
                                        <Users className="mb-1 h-5 w-5 text-navy-blue" />
                                        <span className="text-[10px] text-slate-gray">
                                            4 Kapasitas
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-gray/10 bg-base-white p-3">
                                        <Cog className="mb-1 h-5 w-5 text-navy-blue" />
                                        <span className="text-[10px] text-slate-gray">
                                            Otomatis
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-gray/10 bg-base-white p-3">
                                        <Fuel className="mb-1 h-5 w-5 text-navy-blue" />
                                        <span className="text-[10px] text-slate-gray">
                                            Bensin
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-gray/10 bg-base-white p-3">
                                        <Briefcase className="mb-1 h-5 w-5 text-navy-blue" />
                                        <span className="text-[10px] text-slate-gray">
                                            2 Tas
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="mb-4 text-sm font-bold text-navy-blue">
                                        Fitur yang Termasuk
                                    </h4>
                                    {[
                                        'Pengemudi profesional tersedia',
                                        'Asuransi komprehensif',
                                        'AC dan sistem audio',
                                        'Pembatalan gratis maksimal 24 jam sebelumnya',
                                    ].map((f) => (
                                        <div
                                            key={f}
                                            className="flex items-center gap-3"
                                        >
                                            <CheckCircle2 className="h-5 w-5 text-success-green" />
                                            <span className="text-sm font-medium text-navy-blue">
                                                {f}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {step === 'booking' && (
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    goToDriverStep();
                                }}
                                className="flex flex-col gap-5"
                            >
                                {/* Price estimate banner */}
                                {(() => {
                                    const rule =
                                        vehicle.category.pricing_rules?.find(
                                            (p) =>
                                                p.rental_unit ===
                                                data.rental_unit,
                                        );
                                    const dur = parseInt(data.duration);

                                    if (rule && dur > 0) {
                                        const total = rule.base_rate * dur;
                                        const unitLabel =
                                            rentalUnits.find(
                                                (u) =>
                                                    u.value ===
                                                    data.rental_unit,
                                            )?.label ?? data.rental_unit;

                                        return (
                                            <div className="flex items-center justify-between rounded-[16px] border border-amber-gold/30 bg-amber-gold/10 px-4 py-3">
                                                <div>
                                                    <p className="text-[10px] font-bold tracking-wider text-amber-gold uppercase">
                                                        Estimasi Total
                                                    </p>
                                                    <p className="mt-0.5 text-xs text-slate-gray">
                                                        {dur} {unitLabel} ×{' '}
                                                        {formatPrice(
                                                            rule.base_rate,
                                                        )}
                                                    </p>
                                                </div>
                                                <p className="text-xl font-extrabold text-navy-blue">
                                                    {formatPrice(total)}
                                                </p>
                                            </div>
                                        );
                                    }

                                    return null;
                                })()}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1 block text-xs font-bold text-navy-blue">
                                            Unit Sewa
                                        </label>
                                        <select
                                            value={data.rental_unit}
                                            onChange={(e) =>
                                                setData(
                                                    'rental_unit',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full appearance-none rounded-full border border-slate-gray/20 bg-base-white bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%207l5%205%205-5%22%20fill%3D%22none%22%20stroke%3D%22%23666664%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25em_1.25em] bg-[position:right_1rem_center] bg-no-repeat px-4 py-2.5 pr-10 text-sm outline-none focus:border-amber-gold focus:ring-1 focus:ring-amber-gold"
                                        >
                                            {rentalUnits.map((u) => (
                                                <option
                                                    key={u.value}
                                                    value={u.value}
                                                >
                                                    {u.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-bold text-navy-blue">
                                            Durasi
                                        </label>
                                        <input
                                            type="number"
                                            min={1}
                                            value={data.duration}
                                            onChange={(e) =>
                                                setData(
                                                    'duration',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Cth: 3"
                                            className="w-full rounded-full border border-slate-gray/20 bg-base-white px-4 py-2.5 text-sm outline-none focus:border-amber-gold focus:ring-1 focus:ring-amber-gold"
                                        />
                                        {errors.duration && (
                                            <p className="mt-1 text-xs font-medium text-red-500">
                                                {errors.duration}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-bold text-navy-blue">
                                        Waktu Mulai
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={data.start_at}
                                        onChange={(e) =>
                                            setData('start_at', e.target.value)
                                        }
                                        className="w-full rounded-full border border-slate-gray/20 bg-base-white px-4 py-2.5 text-sm outline-none focus:border-amber-gold focus:ring-1 focus:ring-amber-gold"
                                    />
                                    {errors.start_at && (
                                        <p className="mt-1 text-xs font-medium text-red-500">
                                            {errors.start_at}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-bold text-navy-blue">
                                        Opsi Penjemputan
                                    </label>
                                    <select
                                        value={data.pickup_option}
                                        onChange={(e) =>
                                            setData(
                                                'pickup_option',
                                                e.target.value,
                                            )
                                        }
                                        className="w-full appearance-none rounded-full border border-slate-gray/20 bg-base-white bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%207l5%205%205-5%22%20fill%3D%22none%22%20stroke%3D%22%23666664%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25em_1.25em] bg-[position:right_1rem_center] bg-no-repeat px-4 py-2.5 pr-10 text-sm outline-none focus:border-amber-gold focus:ring-1 focus:ring-amber-gold"
                                    >
                                        {pickupOptions.map((p) => (
                                            <option
                                                key={p.value}
                                                value={p.value}
                                            >
                                                {p.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {data.pickup_option ===
                                    'deliver_to_customer' && (
                                    <div>
                                        <label className="mb-1 block text-xs font-bold text-navy-blue">
                                            Alamat Pengiriman
                                        </label>
                                        <textarea
                                            value={data.delivery_address}
                                            onChange={(e) =>
                                                setData(
                                                    'delivery_address',
                                                    e.target.value,
                                                )
                                            }
                                            rows={2}
                                            className="w-full rounded-[16px] border border-slate-gray/20 bg-base-white px-4 py-2.5 text-sm outline-none focus:border-amber-gold focus:ring-1 focus:ring-amber-gold"
                                            placeholder="Detail alamat lengkap"
                                        />
                                        {errors.delivery_address && (
                                            <p className="mt-1 text-xs font-medium text-red-500">
                                                {errors.delivery_address}
                                            </p>
                                        )}
                                    </div>
                                )}

                                <div className="flex items-center gap-3 rounded-[12px] border border-slate-gray/10 bg-base-white p-3">
                                    <input
                                        id="out_of_town"
                                        type="checkbox"
                                        checked={data.is_out_of_town}
                                        onChange={(e) =>
                                            setData(
                                                'is_out_of_town',
                                                e.target.checked,
                                            )
                                        }
                                        className="h-4 w-4 rounded border-slate-gray/30 text-amber-gold focus:ring-amber-gold"
                                    />
                                    <label
                                        htmlFor="out_of_town"
                                        className="text-xs font-bold text-navy-blue"
                                    >
                                        Perjalanan Luar Kota{' '}
                                        <span className="ml-1 text-[10px] font-medium text-slate-gray">
                                            (+ biaya tambahan)
                                        </span>
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="mt-2 w-full rounded-full bg-navy-blue py-3.5 text-sm font-bold text-base-white shadow-md transition-all hover:bg-navy-blue/90 disabled:opacity-50"
                                >
                                    {processing
                                        ? 'Memproses...'
                                        : 'Lanjutkan Pilih Pengemudi'}
                                </button>
                            </form>
                        )}

                        {step === 'driver' && (
                            <div className="flex flex-col gap-4">
                                <p className="text-sm text-slate-gray">
                                    Pilih pengemudi profesional untuk perjalanan
                                    Anda.
                                </p>

                                {!isLoyalCustomer && (
                                    <div className="rounded-[16px] border border-amber-gold/30 bg-amber-gold/5 p-4 text-sm text-slate-gray">
                                        <p className="mb-1 font-semibold text-navy-blue">
                                            Fitur eksklusif pelanggan setia
                                        </p>
                                        <p className="text-xs">
                                            Pemilihan pengemudi manual hanya
                                            tersedia setelah Anda menyelesaikan
                                            minimal 1 pemesanan. Pengemudi akan
                                            ditugaskan otomatis untuk pesanan
                                            ini.
                                        </p>
                                    </div>
                                )}

                                {drivers.length === 0 ? (
                                    <div className="rounded-[16px] border border-slate-gray/10 bg-base-white p-8 text-center text-sm text-slate-gray">
                                        Belum ada pengemudi tersedia. Pilih
                                        "Lewati" untuk memesan tanpa pengemudi
                                        sekarang, kami akan menugaskan pengemudi
                                        setelah pesanan Anda diproses.
                                    </div>
                                ) : (
                                    <div
                                        className={`grid gap-3 ${!isLoyalCustomer ? 'pointer-events-none opacity-50' : ''}`}
                                    >
                                        {drivers.map((driver) => {
                                            const isSelected =
                                                selectedDriverId === driver.id;

                                            return (
                                                <div
                                                    key={driver.id}
                                                    onClick={() =>
                                                        isLoyalCustomer &&
                                                        setSelectedDriverId(
                                                            driver.id,
                                                        )
                                                    }
                                                    className={`${isLoyalCustomer ? 'cursor-pointer' : 'cursor-not-allowed'} rounded-[16px] border-2 p-4 transition-all ${isSelected ? 'border-amber-gold bg-base-white shadow-md' : 'border-slate-gray/10 bg-base-white hover:border-amber-gold/50'}`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div
                                                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold ${isSelected ? 'bg-amber-gold text-navy-blue' : 'bg-surface-gray text-slate-gray'}`}
                                                        >
                                                            {driver.user.name
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <h3 className="flex items-center gap-2 text-sm font-bold text-navy-blue">
                                                                {
                                                                    driver.user
                                                                        .name
                                                                }
                                                                {isSelected && (
                                                                    <CheckCircle2 className="h-4 w-4 text-success-green" />
                                                                )}
                                                            </h3>
                                                            <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-gray">
                                                                <Briefcase className="h-3 w-3" />
                                                                {driver.professional_title ||
                                                                    'Pengemudi Profesional'}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-xs font-bold text-slate-gray">
                                                            <Clock className="h-3 w-3" />{' '}
                                                            {
                                                                driver.experience_years
                                                            }{' '}
                                                            thn
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                <div className="mt-2 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={skipDriverSelection}
                                        disabled={processing}
                                        className="flex-1 rounded-full border-2 border-slate-gray/20 py-3 text-sm font-bold text-slate-gray transition-all hover:border-navy-blue hover:text-navy-blue disabled:opacity-50"
                                    >
                                        {processing ? 'Memproses...' : 'Lewati'}
                                    </button>
                                    {isLoyalCustomer && (
                                        <button
                                            type="button"
                                            onClick={submitBooking}
                                            disabled={
                                                processing ||
                                                (drivers.length > 0 &&
                                                    !selectedDriverId)
                                            }
                                            className="flex-1 rounded-full bg-navy-blue py-3 text-sm font-bold text-base-white shadow-md transition-all hover:bg-navy-blue/90 disabled:opacity-50"
                                        >
                                            {processing
                                                ? 'Memproses...'
                                                : 'Konfirmasi Pesanan'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer - Only visible on detail step */}
                    {step === 'detail' && (
                        <div className="flex items-center justify-between border-t border-slate-gray/10 bg-base-white p-6 md:border-t-0 md:bg-transparent md:p-8 md:pt-0">
                            <div className="md:hidden">
                                <p className="mb-1 text-xs font-medium text-slate-gray">
                                    Mulai dari
                                </p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-xl font-extrabold text-navy-blue">
                                        {mainPrice}
                                    </span>
                                    <span className="text-xs font-medium text-slate-gray">
                                        {unit}
                                    </span>
                                </div>
                            </div>

                            {!auth?.user ? (
                                <Link
                                    href="/login"
                                    className="ml-auto rounded-full bg-navy-blue px-8 py-3.5 text-sm font-bold text-base-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-navy-blue/90"
                                >
                                    Masuk untuk Memesan
                                </Link>
                            ) : (
                                <button
                                    onClick={() => setStep('booking')}
                                    aria-label="Pesan Sekarang"
                                    className="ml-auto flex items-center gap-2 rounded-full bg-navy-blue px-4 py-3.5 text-sm font-bold text-base-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-navy-blue/90 sm:px-8"
                                >
                                    <ShoppingCart className="h-5 w-5 shrink-0" />
                                    <span className="hidden sm:inline">
                                        Pesan Sekarang
                                    </span>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
