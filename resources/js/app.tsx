import { createInertiaApp } from '@inertiajs/react';

import { ConfirmProvider } from '@/components/ui/confirm-modal';
import { Toaster } from '@/components/ui/toast';

const appName = import.meta.env.VITE_APP_NAME || 'URBAN 8';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    progress: {
        color: '#4B5563',
    },
    withApp: (app) => (
        <ConfirmProvider>
            {app}
            <Toaster />
        </ConfirmProvider>
    ),
});
