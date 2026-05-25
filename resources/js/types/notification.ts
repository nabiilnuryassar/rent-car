export type NotificationItem = {
    id: string;
    title: string;
    body?: string | null;
    created_at: string | null;
    read: boolean;
    href?: string | null;
};
