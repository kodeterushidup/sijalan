import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Flash from '@/components/Flash';
import PageHeader from '@/components/PageHeader';
import Pagination from '@/components/Pagination';
import StatusBadge from '@/components/StatusBadge';
import { formatDateShort, formatRupiah } from '@/lib/format';
import { btnPrimary, btnSecondary, cardClass, inputClass, labelClass } from '@/lib/styles';
import type { Paginated, TripStatus } from '@/types';

type UnitOption = { value: number; label: string };

type TripRow = {
    id: number;
    maksud: string;
    tempat_tujuan: string;
    pegawai: string;
    nip: string | null;
    unit: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
    lama_hari: number;
    status: TripStatus;
    status_label: string;
    nomor_sppd: string | null;
    total_biaya: number;
};

type Filters = {
    q: string;
    status: string;
    unit: number | null;
    pegawai: number | null;
    dari: string;
    sampai: string;
};

export default function TripsIndex({
    trips,
    units,
    employees,
    statuses,
    filters,
    canManage,
}: {
    trips: Paginated<TripRow>;
    units: UnitOption[];
    employees: UnitOption[];
    statuses: { value: string; label: string }[];
    filters: Filters;
    canManage: boolean;
}) {
    const [form, setForm] = useState({
        q: filters.q,
        status: filters.status,
        unit: filters.unit ? String(filters.unit) : '',
        pegawai: filters.pegawai ? String(filters.pegawai) : '',
        dari: filters.dari,
        sampai: filters.sampai,
    });

    function apply(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        router.get('/perjalanan', {
            q: form.q || undefined,
            status: form.status || undefined,
            unit: form.unit || undefined,
            pegawai: form.pegawai || undefined,
            dari: form.dari || undefined,
            sampai: form.sampai || undefined,
        }, { preserveState: true, replace: true });
    }

    function resetFilters() {
        setForm({ q: '', status: '', unit: '', pegawai: '', dari: '', sampai: '' });
        router.get('/perjalanan', {}, { preserveState: true, replace: true });
    }

    return (
        <AppLayout>
            <Head title="Perjalanan dinas" />
            <Flash />
            <PageHeader
                title="Perjalanan dinas"
                description={
                    canManage
                        ? 'Catat perjalanan pegawai, lengkapi rincian biaya, lalu ajukan ke Pejabat Penyetuju.'
                        : 'Riwayat dan jadwal perjalanan dinas yang tercatat untuk Anda.'
                }
                actions={
                    canManage ? (
                        <Link href="/perjalanan/baru" className={btnPrimary}>
                            Perjalanan baru
                        </Link>
                    ) : undefined
                }
            />

            <form onSubmit={apply} className={`${cardClass} mb-4 p-4`}>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                        <label htmlFor="q" className={labelClass}>Cari</label>
                        <input
                            id="q"
                            type="search"
                            value={form.q}
                            onChange={(event) => setForm({ ...form, q: event.target.value })}
                            placeholder="Maksud, tujuan, atau nomor SPPD"
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label htmlFor="status" className={labelClass}>Status</label>
                        <select
                            id="status"
                            value={form.status}
                            onChange={(event) => setForm({ ...form, status: event.target.value })}
                            className={inputClass}
                        >
                            <option value="">Semua status</option>
                            {statuses.map((status) => (
                                <option key={status.value} value={status.value}>{status.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="unit" className={labelClass}>Unit kerja</label>
                        <select
                            id="unit"
                            value={form.unit}
                            onChange={(event) => setForm({ ...form, unit: event.target.value })}
                            className={inputClass}
                        >
                            <option value="">Semua unit</option>
                            {units.map((unit) => (
                                <option key={unit.value} value={unit.value}>{unit.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="pegawai" className={labelClass}>Pegawai</label>
                        <select
                            id="pegawai"
                            value={form.pegawai}
                            onChange={(event) => setForm({ ...form, pegawai: event.target.value })}
                            className={inputClass}
                        >
                            <option value="">Semua pegawai</option>
                            {employees.map((employee) => (
                                <option key={employee.value} value={employee.value}>{employee.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="dari" className={labelClass}>Mulai dari</label>
                        <input
                            id="dari"
                            type="date"
                            value={form.dari}
                            onChange={(event) => setForm({ ...form, dari: event.target.value })}
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label htmlFor="sampai" className={labelClass}>Sampai dengan</label>
                        <input
                            id="sampai"
                            type="date"
                            value={form.sampai}
                            onChange={(event) => setForm({ ...form, sampai: event.target.value })}
                            className={inputClass}
                        />
                    </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                    <button type="submit" className={btnPrimary}>Terapkan filter</button>
                    <button type="button" onClick={resetFilters} className={btnSecondary}>Atur ulang</button>
                </div>
            </form>

            {trips.data.length === 0 ? (
                <div className="rounded-md border border-dashed border-line bg-surface px-5 py-10 text-center">
                    <p className="font-display text-xl text-ink">Belum ada perjalanan yang cocok</p>
                    <p className="mx-auto mt-1 max-w-md text-sm text-muted">
                        {canManage
                            ? 'Ubah filter atau buat perjalanan dinas pertama dari tombol di atas.'
                            : 'Perjalanan yang dibuat Admin Kepegawaian akan muncul di sini.'}
                    </p>
                </div>
            ) : (
                <>
                    <ul className="space-y-3 lg:hidden">
                        {trips.data.map((trip) => (
                            <li key={trip.id} className={`${cardClass} p-4`}>
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                    <StatusBadge status={trip.status} label={trip.status_label} />
                                    <p className="text-xs text-muted">
                                        {formatDateShort(trip.tanggal_mulai)} - {formatDateShort(trip.tanggal_selesai)}
                                    </p>
                                </div>
                                <Link
                                    href={`/perjalanan/${trip.id}`}
                                    className="mt-2 block font-semibold text-ink underline-offset-2 hover:underline"
                                >
                                    {trip.maksud}
                                </Link>
                                <p className="mt-1 text-sm text-muted">
                                    {trip.tempat_tujuan} · {trip.pegawai}
                                </p>
                                <p className="mt-2 text-sm text-ink">
                                    {trip.lama_hari} hari · {formatRupiah(trip.total_biaya)}
                                </p>
                                <p className="mt-1 text-xs text-muted">
                                    {trip.nomor_sppd ? `SPPD ${trip.nomor_sppd}` : 'Nomor SPPD belum terbit'}
                                </p>
                            </li>
                        ))}
                    </ul>

                    <div className={`${cardClass} hidden overflow-x-auto lg:block`}>
                        <table className="w-full border-collapse text-left text-sm">
                            <caption className="sr-only">Daftar perjalanan dinas</caption>
                            <thead>
                                <tr className="border-b border-line text-xs uppercase tracking-wide text-muted">
                                    <th scope="col" className="px-4 py-3 font-semibold">Perjalanan</th>
                                    <th scope="col" className="px-4 py-3 font-semibold">Pegawai</th>
                                    <th scope="col" className="px-4 py-3 font-semibold">Tanggal</th>
                                    <th scope="col" className="px-4 py-3 font-semibold">Biaya</th>
                                    <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                                    <th scope="col" className="px-4 py-3 font-semibold">
                                        <span className="sr-only">Tindakan</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-line">
                                {trips.data.map((trip) => (
                                    <tr key={trip.id}>
                                        <td className="px-4 py-3">
                                            <p className="font-semibold text-ink">{trip.maksud}</p>
                                            <p className="text-xs text-muted">
                                                {trip.tempat_tujuan} · {trip.unit}
                                            </p>
                                            <p className="text-xs text-muted">
                                                {trip.nomor_sppd ?? 'Nomor SPPD belum terbit'}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-ink">{trip.pegawai}</p>
                                            <p className="text-xs text-muted">NIP {trip.nip ?? '-'}</p>
                                        </td>
                                        <td className="px-4 py-3 text-ink">
                                            {formatDateShort(trip.tanggal_mulai)}
                                            <br />
                                            <span className="text-xs text-muted">s.d. {formatDateShort(trip.tanggal_selesai)}</span>
                                        </td>
                                        <td className="px-4 py-3 text-ink">{formatRupiah(trip.total_biaya)}</td>
                                        <td className="px-4 py-3">
                                            <StatusBadge status={trip.status} label={trip.status_label} />
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Link
                                                href={`/perjalanan/${trip.id}`}
                                                className="inline-flex min-h-11 items-center rounded-sm px-2 text-sm font-semibold text-accent underline underline-offset-2"
                                            >
                                                Lihat
                                                <span className="sr-only"> detail {trip.maksud}</span>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            <Pagination page={trips} label="Halaman perjalanan dinas" />
        </AppLayout>
    );
}
