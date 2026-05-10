import { type ReactNode } from 'react';

type BadgeProps = {
    children: ReactNode;
    color?: 'green' | 'red' | 'yellow' | 'orange' | 'blue' | 'purple' | 'teal' | 'gray';
};

const colorClasses = {
    green: 'bg-pale-green text-success-green',
    red: 'bg-red-100 text-red-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    orange: 'bg-orange-100 text-orange-700',
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
    teal: 'bg-teal-100 text-teal-700',
    gray: 'bg-gray-100 text-gray-700',
};

export default function Badge({ children, color = 'gray' }: BadgeProps) {
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${colorClasses[color]}`}>
            {children}
        </span>
    );
}
