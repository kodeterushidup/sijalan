import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Flash from '@/components/Flash';
import PageHeader from '@/components/PageHeader';
import { btnPrimary, btnSecondary, cardClass, inputClass, labelClass } from '@/lib/styles';
import type { Paginated, Role, SharedPageProps } from '@/types';

type Account = {
    id: number;
    name: string;
    email: string;
    role: Role;
    role_label: string;
    unit: string | null;
    is_active: boolean;
};

export default function AccountsIndex({
    accounts,
    filters,
}: {
    accounts: Paginated<Account>;
    filters: { q: string };
}) {
    const { auth } = usePage<SharedPageProps>().props;
    const [query, setQuery] = useState(filters.q);

    function search(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        router.get('/akun', { q: query }, { preserveState: true, replace: true });
    }

    return (
        <AppLayout>
            <Flash />
            <PageHeader
                title="Akun dan peran"
                description="Kelola akses masuk dan peran setiap pengguna aplikasi."
                actions={
                    <Link href="/akun/baru" className={btnPrimary}>
                        Tambah akun
                    </Link>
                }
            />

            <form onSubmit={search} className="mb-4 flex flex-wrap items-end gap-3">
                <div className="min-w-0 flex-1">
                    <label htmlFor="q" className={labelClass}>
                        Cari akun
                    </label>
                    <input
                        id="q"
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Nama, email, atau NIP"
                        className={inputClass}
                    />
                </div>
                <button type="submit" className={btnSecondary}>
                    Cari
                </button>
            </form>

            <div
                tabIndex={0}
                role="region"
                aria-labelledby="akun-caption"
                className={`${cardClass} relative overflow-x-auto`}
            >
                <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
                    <caption id="akun-caption" className="sr-only">
                        Daftar akun pengguna
                    </caption>
                    <thead>
                        <tr className="border-b border-line text-xs uppercase tracking-wide text-muted">
                            <th scope="col" className="px-4 py-3 font-semibold">Nama</th>
                            <th scope="col" className="px-4 py-3 font-semibold">Peran</th>
                            <th scope="col" className="px-4 py-3 font-semibold">Unit kerja</th>
                            <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                            <th scope="col" className="px-4 py-3 font-semibold">
                                <span className="sr-only">Tindakan</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                        {accounts.data.map((account) => (
                            <tr key={account.id} className="transition-colors hover:bg-paper/60">
                                <td className="px-4 py-3">
                                    <p className="font-semibold text-ink">{account.name}</p>
                                    <p className="text-xs text-muted">{account.email}</p>
                                </td>
                                <td className="px-4 py-3 text-ink">{account.role_label}</td>
                                <td className="px-4 py-3 text-muted">{account.unit ?? '-'}</td>
                                <td className="px-4 py-3">
                                    <span
                                        className={`inline-flex rounded-sm border px-2 py-0.5 text-xs font-semibold ${
                                            account.is_active
                                                ? 'border-success/30 bg-success-soft text-success'
                                                : 'border-line bg-paper text-muted'
                                        }`}
                                    >
                                        {account.is_active ? 'Aktif' : 'Nonaktif'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <Link
                                        href={`/akun/${account.id}/edit`}
                                        className="inline-flex min-h-11 items-center rounded-sm px-2 text-sm font-semibold text-accent underline underline-offset-2"
                                    >
                                        Ubah
                                        <span className="sr-only"> akun {account.name}</span>
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {accounts.data.length === 0 ? (
                <p className="mt-4 rounded-md border border-dashed border-line bg-surface px-4 py-6 text-center text-sm text-muted">
                    Tidak ada akun yang cocok dengan pencarian. Kosongkan kata kunci untuk melihat semua akun.
                </p>
            ) : null}

            <nav aria-label="Halaman akun" className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
                <p className="text-muted">
                    Menampilkan {accounts.data.length} dari {accounts.total} akun
                </p>
                <div className="flex gap-2">
                    {accounts.prev_page_url ? (
                        <Link href={accounts.prev_page_url} className={btnSecondary}>
                            Sebelumnya
                        </Link>
                    ) : null}
                    {accounts.next_page_url ? (
                        <Link href={accounts.next_page_url} className={btnSecondary}>
                            Berikutnya
                        </Link>
                    ) : null}
                </div>
            </nav>

            <p className="mt-3 text-xs text-muted">
                Halaman {accounts.current_page} dari {accounts.last_page}. Anda masuk sebagai {auth.user?.name}.
            </p>
        </AppLayout>
    );
}
