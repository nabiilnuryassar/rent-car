import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid, UserCircle, ClipboardList, User } from 'lucide-react';

export default function MobileBottomNav() {
    const { url } = usePage();

    const navItems = [
        { label: 'Katalog', icon: LayoutGrid, href: '/catalog' },
        { label: 'Driver', icon: UserCircle, href: '/drivers' },
        { label: 'Pesanan', icon: ClipboardList, href: '/orders' },
        { label: 'Profil', icon: User, href: '/profile' },
    ];

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-sm rounded-full bg-navy-blue px-6 py-4 shadow-2xl md:hidden">
            <nav className="flex items-center justify-between">
                {navItems.map((item) => {
                    const isActive = url.startsWith(item.href);

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`flex flex-col items-center gap-1 transition-all ${
                                isActive ? 'text-amber-gold scale-110' : 'text-base-white/60 hover:text-base-white'
                            }`}
                        >
                            <item.icon className="h-6 w-6" strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[10px] font-bold">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
