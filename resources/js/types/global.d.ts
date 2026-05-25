import type { Auth } from '@/types/auth';
import type { NotificationItem } from '@/types/notification';

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            notifications?: NotificationItem[];
            sidebarOpen: boolean;
            [key: string]: unknown;
        };
    }
}
