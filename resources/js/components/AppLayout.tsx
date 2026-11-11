import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { Role, SharedPageProps } from '@/types';

type NavItem = {
    label: string;
    href: string;
};

const navByRole: Record<Role, NavItem[]> = {
    super_admin: [
        { label: 'Ringkasan', href: '/' },
        { label: 'Kalender', href: '/kalender' },
        { label: 'Perjalanan', href: '/perjalanan' },
        { label: 'Pegawai', href: '/pegawai' },
        { label: 'Unit kerja', href: '/unit' },
        { label: 'Akun', href: '/akun' },
        { label: 'Pengaturan', href: '/pengaturan' },
        { label: 'Profil', href: '/profil' },
    ],
    admin: [
        { label: 'Ringkasan', href: '/' },
        { label: 'Kalender', href: '/kalender' },
        { label: 'Perjalanan', href: '/perjalanan' },
        { label: 'Pegawai', href: '/pegawai' },
        { label: 'Unit kerja', href: '/unit' },
        { label: 'Profil', href: '/profil' },
    ],
    pejabat: [
        { label: 'Ringkasan', href: '/' },
        { label: 'Kalender', href: '/kalender' },
        { label: 'Persetujuan', href: '/persetujuan' },
        { label: 'Perjalanan', href: '/perjalanan' },
        { label: 'Profil', href: '/profil' },
    ],
    pegawai: [
        { label: 'Ringkasan', href: '/' },
        { label: 'Kalender', href: '/kalender' },
        { label: 'Riwayat perjalanan', href: '/perjalanan' },
        { label: 'Profil', href: '/profil' },
    ],
};

function useActive(href: string): boolean {
    const { url } = usePage();

    return href === '/' ? url === '/' : url.startsWith(href);
}

function NavList({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
    return (
        <ul className="space-y-1">
            {items.map((item) => (
                <NavLink key={item.href} item={item} onNavigate={onNavigate} />
            ))}
        </ul>
    );
}

function NavLink({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
    const active = useActive(item.href);

    return (
        <li>
            <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? 'page' : undefined}
                className={`flex min-h-11 items-center rounded-sm px-3 text-sm font-medium transition-colors ${
                    active
                        ? 'bg-white/10 text-white'
                        : 'text-white/75 hover:bg-white/10 hover:text-white'
                }`}
            >
                {item.label}
            </Link>
        </li>
    );
}

function Brand({ compact = false }: { compact?: boolean }) {
    return (
        <div>
            <p
                className={`font-display leading-none tracking-wide text-white ${
                    compact ? 'text-xl' : 'text-3xl'
                }`}
            >
                SIJALAN
            </p>
            <p className="mt-1 text-xs text-white/70">Sistem Perjalanan Dinas</p>
        </div>
    );
}

function UserPanel({ compact = false }: { compact?: boolean }) {
    const { auth } = usePage<SharedPageProps>().props;
    const user = auth.user;

    if (!user) {
        return null;
    }

    return (
        <div className={`flex items-center gap-3 ${compact ? '' : 'border-t border-white/15 pt-4'}`}>
            <span
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent-deep"
                aria-hidden="true"
            >
                {user.initials}
            </span>
            <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{user.name}</p>
                <p className="truncate text-xs text-white/70">
                    {user.role_label}
                    {user.unit ? ` · ${user.unit}` : ''}
                </p>
            </div>
        </div>
    );
}

export default function AppLayout({ children }: { children: ReactNode }) {
    const { auth } = usePage<SharedPageProps>().props;
    const { url } = usePage();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDialogElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    const items = auth.user ? navByRole[auth.user.role] : [];

    useEffect(() => {
        setMenuOpen(false);
    }, [url]);

    useEffect(() => {
        const dialog = menuRef.current;

        if (!dialog) {
            return;
        }

        if (menuOpen && !dialog.open) {
            dialog.showModal();
            closeButtonRef.current?.focus();
        }

        if (!menuOpen && dialog.open) {
            dialog.close();
        }
    }, [menuOpen]);

    useEffect(() => {
        const wide = window.matchMedia('(min-width: 64rem)');

        function closeOnWide(event: MediaQueryListEvent) {
            if (event.matches) {
                setMenuOpen(false);
            }
        }

        wide.addEventListener('change', closeOnWide);

        return () => wide.removeEventListener('change', closeOnWide);
    }, []);

    return (
        <div className="min-h-dvh bg-paper">
            <a
                href="#konten"
                className="sr-only z-50 rounded-sm bg-surface px-4 py-3 text-sm font-semibold text-ink focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
            >
                Lewati ke konten
            </a>

            <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/10 bg-ink px-4 py-6 lg:flex">
                <div className="px-2">
                    <Brand />
                </div>

                <nav aria-label="Navigasi utama" className="mt-10 flex-1">
                    <NavList items={items} />
                </nav>

                <div className="space-y-4">
                    <UserPanel />
                    <button
                        type="button"
                        onClick={() => router.post('/logout')}
                        className="flex min-h-11 w-full items-center rounded-sm px-3 text-sm font-medium text-white/75 transition-colors hover:bg-white/10 hover:text-white"
                    >
                        Keluar
                    </button>
                </div>
            </aside>

            <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-surface px-4 py-3 lg:hidden">
                <p className="font-display text-xl leading-none tracking-wide text-ink">SIJALAN</p>
                <button
                    type="button"
                    onClick={() => setMenuOpen(true)}
                    aria-expanded={menuOpen}
                    aria-controls="menu-mobile"
                    className="inline-flex min-h-11 items-center rounded-sm border border-line px-3 text-sm font-semibold text-ink"
                >
                    Menu
                </button>
            </header>

            <dialog
                ref={menuRef}
                id="menu-mobile"
                aria-labelledby="menu-mobile-title"
                onClose={() => setMenuOpen(false)}
                onClick={(event) => {
                    if (event.target === menuRef.current) {
                        setMenuOpen(false);
                    }
                }}
                className="m-0 h-dvh max-h-dvh w-72 max-w-[85vw] bg-ink text-white backdrop:bg-ink/50"
            >
                <div className="flex h-full flex-col overflow-y-auto px-4 py-5">
                    <h2 id="menu-mobile-title" className="sr-only">
                        Menu navigasi
                    </h2>

                    <div className="flex items-start justify-between gap-3">
                        <Brand compact />
                        <button
                            ref={closeButtonRef}
                            type="button"
                            onClick={() => setMenuOpen(false)}
                            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-sm border border-white/25 px-3 text-sm font-semibold text-white"
                        >
                            Tutup
                        </button>
                    </div>

                    <nav aria-label="Navigasi utama (menu seluler)" className="mt-8 flex-1">
                        <NavList items={items} onNavigate={() => setMenuOpen(false)} />
                    </nav>

                    <div className="space-y-4">
                        <UserPanel />
                        <button
                            type="button"
                            onClick={() => router.post('/logout')}
                            className="flex min-h-11 w-full items-center rounded-sm px-3 text-sm font-medium text-white/75 transition-colors hover:bg-white/10 hover:text-white"
                        >
                            Keluar
                        </button>
                    </div>
                </div>
            </dialog>

            <main id="konten" tabIndex={-1} className="lg:pl-64">
                <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
                    {children}
                </div>
            </main>
        </div>
    );
}
