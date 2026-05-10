import type {ReactNode} from 'react';

type VehicleBadgeProps = {
    children: ReactNode;
    type?: 'primary' | 'success' | 'info' | 'popular';
    icon?: ReactNode;
};

const badgeStyles = {
    primary: 'bg-base-white/30 text-navy-blue border-amber-gold/30',
    success: 'bg-pale-green text-success-green border-green-200',
    info: 'bg-blue-100 text-blue-700 border-blue-200',
    popular: 'bg-amber-gold/20 text-yellow-800 border-amber-gold/30',
};

export default function VehicleBadge({ children, type = 'primary', icon }: VehicleBadgeProps) {
    return (
        <div className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badgeStyles[type]}`}>
            {icon && <span className="flex items-center justify-center">{icon}</span>}
            <span>{children}</span>
        </div>
    );
}
