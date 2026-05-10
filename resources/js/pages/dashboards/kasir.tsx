import StatCard from '@/components/stat-card';
import AppLayout from '@/layouts/app-layout';

export default function KasirDashboard() {
    return (
        <AppLayout title="Dashboard Kasir" eyebrow="Kasir">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                <StatCard
                    label="Pembayaran tunai"
                    value="0"
                    detail="Belum ada input pembayaran."
                />
                <StatCard
                    label="Transfer verifikasi"
                    value="0"
                    detail="Belum ada bukti transfer."
                />
                <StatCard
                    label="Kwitansi terbit"
                    value="0"
                    detail="Menunggu pembayaran lunas."
                />
            </div>
        </AppLayout>
    );
}
