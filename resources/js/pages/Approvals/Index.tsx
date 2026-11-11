import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/components/AppLayout';
import Flash from '@/components/Flash';
import PageHeader from '@/components/PageHeader';
import Pagination from '@/components/Pagination';
import { formatDateShort, formatDateTime, formatRupiah } from '@/lib/format';
import { btnSecondary, cardClass } from '@/lib/styles';
import type { Paginated } from '@/types';

type ApprovalRow = {
    id: number;
    maksud: string;
    tempat_tujuan: string;
    pegawai: string;
    nip: string | null;
    unit: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
    lama_hari: number;
    total_biaya: number;
    diajukan_at: string | null;
};

export default function ApprovalsIndex({ trips }: { trips: Paginated<ApprovalRow> }) {
    return (
        <AppLayout>
            <Head title="Antrean persetujuan" />
            <Flash />
            <PageHeader
                title="Antrean persetujuan"
                description="Perjalanan yang menunggu keputusan Anda, yang paling lama diajukan di atas."
            />

            {trips.data.length === 0 ? (
                <div className="rounded-md border border-dashed border-line bg-surface px-5 py-10 text-center">
                    <p className="font-display text-xl text-ink">Tidak ada yang menunggu</p>
                    <p className="mx-auto mt-1 max-w-md text-sm text-muted">
                        Antrean kosong. Perjalanan baru akan muncul di sini setelah Admin Kepegawaian mengajukannya.
                    </p>
                </div>
            ) : (
                <>
                    <ul className="space-y-3 lg:hidden">
                        {trips.data.map((trip) => (
                            <li key={trip.id} className={`${cardClass} p-4`}>
                                <p className="text-xs text-muted">Diajukan {formatDateTime(trip.diajukan_at)}</p>
                                <Link
                                    href={`/perjalanan/${trip.id}`}
                                    className="mt-1 block font-semibold text-ink underline-offset-2 hover:underline"
                                >
                                    {trip.maksud}
                                </Link>
                                <p className="mt-1 text-sm text-muted">
                                    {trip.pegawai} · {trip.unit}
                                </p>
                                <p className="mt-1 text-sm text-ink">
                                    {trip.tempat_tujuan} · {trip.lama_hari} hari
                                </p>
                                <p className="mt-2 text-sm font-semibold text-ink">{formatRupiah(trip.total_biaya)}</p>
                                <Link href={`/perjalanan/${trip.id}`} className={`${btnSecondary} mt-3`}>
                                    Periksa
                                </Link>
                            </li>
                        ))}
                    </ul>

                    <div
                        tabIndex={0}
                        role="region"
                        aria-labelledby="persetujuan-caption"
                        className={`${cardClass} relative hidden overflow-x-auto lg:block`}
                    >
                        <table className="w-full border-collapse text-left text-sm">
                            <caption id="persetujuan-caption" className="sr-only">
                                Perjalanan yang menunggu persetujuan
                            </caption>
                            <thead>
                                <tr className="border-b border-line text-xs uppercase tracking-wide text-muted">
                                    <th scope="col" className="px-4 py-3 font-semibold">Diajukan</th>
                                    <th scope="col" className="px-4 py-3 font-semibold">Perjalanan</th>
                                    <th scope="col" className="px-4 py-3 font-semibold">Pegawai</th>
                                    <th scope="col" className="px-4 py-3 font-semibold">Tanggal</th>
                                    <th scope="col" className="px-4 py-3 font-semibold">Biaya</th>
                                    <th scope="col" className="px-4 py-3 font-semibold">
                                        <span className="sr-only">Tindakan</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-line">
                                {trips.data.map((trip) => (
                                    <tr key={trip.id} className="transition-colors hover:bg-paper/60">
                                        <td className="px-4 py-3 text-xs text-muted tabular-nums">{formatDateTime(trip.diajukan_at)}</td>
                                        <td className="px-4 py-3">
                                            <p className="font-semibold text-ink">{trip.maksud}</p>
                                            <p className="text-xs text-muted">{trip.tempat_tujuan} · {trip.unit}</p>
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
                                        <td className="px-4 py-3 text-right">
                                            <Link
                                                href={`/perjalanan/${trip.id}`}
                                                className="inline-flex min-h-11 items-center rounded-sm px-2 text-sm font-semibold text-accent underline underline-offset-2"
                                            >
                                                Periksa
                                                <span className="sr-only"> {trip.maksud}</span>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            <Pagination page={trips} label="Halaman antrean persetujuan" />
        </AppLayout>
    );
}
