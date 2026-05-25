type VehicleImageSource = {
    images?: string[] | null;
    category?: { name?: string | null } | null;
} | null;

function slug(value: string): string {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export function vehicleImage(vehicle: VehicleImageSource): string {
    const firstImage = vehicle?.images?.[0];

    if (firstImage) {
        return firstImage.startsWith('/') ? firstImage : `/storage/${firstImage}`;
    }

    const category = vehicle?.category?.name;

    if (category) {
        return `/images/mockup/${slug(category)}.png`;
    }

    return '/images/landing/fleet-side.jpg';
}
