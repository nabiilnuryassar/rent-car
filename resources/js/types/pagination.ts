export type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

export type PaginationMeta = {
    current_page: number;
    last_page: number;
    total: number;
    from: number | null;
    to: number | null;
    per_page: number;
};

export type Paginated<T> = PaginationMeta & {
    data: T[];
    links: PaginationLink[];
};
