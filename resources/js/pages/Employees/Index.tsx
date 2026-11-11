import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Flash from '@/components/Flash';
import PageHeader from '@/components/PageHeader';
import Pagination from '@/components/Pagination';
import { btnDanger, btnPrimary, btnSecondary, cardClass, errorClass, inputClass, labelClass } from '@/lib/styles';
import type { Paginated } from '@/types';

type UnitOption = { value: number; label: string };

type Employee = {
    id: number;
    name: string;
    nip: string | null;
    jabatan: string | null;
    golongan: string | null;
    email: string;
    unit: string | null;
    is_active: boolean;
    is_google_account: boolean;
    can_delete: boolean;
};

export default function EmployeesIndex({
    employees,
    units,
    filters,
    importErrors,
}: {
    employees: Paginated<Employee>;
    units: UnitOption[];
    filters: { q: string; unit: number | null };
    importErrors: string[];
}) {
    const [query, setQuery] = useState(filters.q);
    const [unit, setUnit] = useState(filters.unit ? String(filters.unit) : '');
    const [confirming, setConfirming] = useState<number | null>(null);

    const importForm = useForm<{ file: File | null }>({ file: null });

    function search(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        router.get('/pegawai', { q: query, unit: unit || undefined }, { preserveState: true, replace: true });
    }

    function submitImport(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        importForm.post('/pegawai/impor', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => importForm.reset(),
        });
    }

    function destroy(employee: Employee) {
        router.delete(`/pegawai/${employee.id}`, {
            preserveScroll: true,
            onFinish: () => setConfirming(null),
        });
    }

    return (
        <AppLayout>
            <Head title="Pegawai" />
            <Flash />
            <PageHeader
                title="Pegawai"
                description="Data pegawai yang dapat ditugaskan dalam perjalanan dinas."
                actions={
                    <Link href="/pegawai/baru" className={btnPrimary}>
                        Tambah pegawai
                    </Link>
                }
            />

            <form onSubmit={search} className="mb-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_14rem_auto] sm:items-end">
                <div className="min-w-0">
                    <label htmlFor="q" className={labelClass}>Cari pegawai</label>
                    <input
                        id="q"
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Nama atau NIP"
                        className={inputClass}
                    />
                </div>
                <div className="min-w-0">
                    <label htmlFor="unit" className={labelClass}>Unit kerja</label>
                    <select
                        id="unit"
                        value={unit}
                        onChange={(event) => setUnit(event.target.value)}
                        className={inputClass}
                    >
                        <option value="">Semua unit</option>
                        {units.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>
                <button type="submit" className={btnSecondary}>Terapkan</button>
            </form>

            <div
                tabIndex={0}
                role="region"
                aria-labelledby="pegawai-caption"
                className={`${cardClass} relative overflow-x-auto`}
            >
                <table className="w-full min-w-[48rem] border-collapse text-left text-sm">
                    <caption id="pegawai-caption" className="sr-only">
                        Daftar pegawai
                    </caption>
                    <thead>
                        <tr className="border-b border-line text-xs uppercase tracking-wide text-muted">
                            <th scope="col" className="px-4 py-3 font-semibold">Nama dan NIP</th>
                            <th scope="col" className="px-4 py-3 font-semibold">Unit dan jabatan</th>
                            <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                            <th scope="col" className="px-4 py-3 font-semibold">
                                <span className="sr-only">Tindakan</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                        {employees.data.map((employee) => (
                            <tr key={employee.id} className="transition-colors hover:bg-paper/60">
                                <td className="px-4 py-3">
                                    <p className="font-semibold text-ink">{employee.name}</p>
                                    <p className="text-xs text-muted">NIP {employee.nip ?? '-'}</p>
                                </td>
                                <td className="px-4 py-3">
                                    <p className="text-ink">{employee.unit ?? '-'}</p>
                                    <p className="text-xs text-muted">
                                        {employee.jabatan ?? 'Jabatan belum diisi'}
                                        {employee.golongan ? ` · ${employee.golongan}` : ''}
                                    </p>
                                </td>
                                <td className="px-4 py-3">
                                    <span
                                        className={`inline-flex rounded-sm border px-2 py-0.5 text-xs font-semibold ${
                                            employee.is_active
                                                ? 'border-success/30 bg-success-soft text-success'
                                                : 'border-line bg-paper text-muted'
                                        }`}
                                    >
                                        {employee.is_active
                                            ? 'Aktif'
                                            : employee.is_google_account && employee.nip === null
                                              ? 'Belum aktif'
                                              : 'Nonaktif'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex flex-wrap items-center justify-end gap-2">
                                        <Link
                                            href={`/pegawai/${employee.id}/edit`}
                                            className="inline-flex min-h-11 items-center rounded-sm px-2 text-sm font-semibold text-accent underline underline-offset-2"
                                        >
                                            Ubah
                                            <span className="sr-only"> data {employee.name}</span>
                                        </Link>
                                        {employee.can_delete ? (
                                            confirming === employee.id ? (
                                                <>
                                                    <button type="button" onClick={() => destroy(employee)} className={btnDanger}>
                                                        Yakin hapus
                                                    </button>
                                                    <button type="button" onClick={() => setConfirming(null)} className={btnSecondary}>
                                                        Batal
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => setConfirming(employee.id)}
                                                    className={btnDanger}
                                                >
                                                    Hapus
                                                    <span className="sr-only"> akun {employee.name}</span>
                                                </button>
                                            )
                                        ) : null}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {employees.data.length === 0 ? (
                <p className="mt-4 rounded-md border border-dashed border-line bg-surface px-4 py-6 text-center text-sm text-muted">
                    Tidak ada pegawai yang cocok. Ubah kata kunci atau tambahkan pegawai baru.
                </p>
            ) : null}

            <Pagination page={employees} label="Halaman pegawai" />

            <section className={`${cardClass} mt-8 p-5`}>
                <h2 className="font-display text-2xl text-ink">Impor dari CSV</h2>
                <p className="mt-1 text-sm text-muted">
                    Urutan kolom: nip, nama, jabatan, golongan, kode_unit, email. Baris pertama dianggap judul.
                    Kata sandi awal sama dengan NIP.
                </p>

                <form onSubmit={submitImport} className="mt-4 flex flex-wrap items-end gap-3">
                    <div className="min-w-0 flex-1">
                        <label htmlFor="file" className={labelClass}>Berkas CSV</label>
                        <input
                            id="file"
                            type="file"
                            accept=".csv,text/csv"
                            onChange={(event) => importForm.setData('file', event.target.files?.[0] ?? null)}
                            className={inputClass}
                        />
                        {importForm.errors.file ? <p className={errorClass} role="alert">{importForm.errors.file}</p> : null}
                    </div>
                    <button
                        type="submit"
                        disabled={importForm.processing || !importForm.data.file}
                        className={btnSecondary}
                    >
                        {importForm.processing ? 'Mengimpor...' : 'Impor pegawai'}
                    </button>
                </form>

                {importErrors.length > 0 ? (
                    <div role="alert" className="mt-4 rounded-sm border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">
                        <p className="font-semibold">Sebagian baris gagal diimpor:</p>
                        <ul className="mt-2 list-disc space-y-1 pl-5">
                            {importErrors.map((message) => (
                                <li key={message}>{message}</li>
                            ))}
                        </ul>
                    </div>
                ) : null}
            </section>
        </AppLayout>
    );
}
