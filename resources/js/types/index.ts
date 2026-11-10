export type Role = 'super_admin' | 'admin' | 'pejabat' | 'pegawai';

export type TripStatus =
    | 'draft'
    | 'diajukan'
    | 'disetujui'
    | 'ditolak'
    | 'berlangsung'
    | 'selesai'
    | 'dibatalkan';

export type AuthUser = {
    id: number;
    name: string;
    email: string;
    role: Role;
    role_label: string;
    unit: string | null;
    initials: string;
    has_ttd: boolean;
};

export type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};

export type SharedPageProps = {
    appName: string;
    auth: {
        user: AuthUser | null;
    };
    flash: {
        success: string | null;
        error: string | null;
    };
};
