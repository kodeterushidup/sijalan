import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Flash from '@/components/Flash';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import { formatDate, formatDateTime, formatRupiah } from '@/lib/format';
import { btnDanger, btnPrimary, btnSecondary, cardClass, errorClass, inputClass, labelClass } from '@/lib/styles';
import type { TripStatus } from '@/types';

type Cost = {
    id: number;
    jenis_biaya: string;
    keterangan: string | null;
    jumlah: number;
    tarif: number;
    subtotal: number;
};

type Trip = {
    id: number;
    nomor_sppd: string | null;
    status: TripStatus;
    status_label: string;
    maksud: string;
    tempat_tujuan: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
    lama_hari: number;
    alat_angkut: string;
    sumber_dana: string;
    catatan: string | null;
    pegawai: {
        name: string;
        nip: string | null;
        jabatan: string | null;
        golongan: string | null;
        unit: string | null;
    };
    unit: string;
    total_biaya: number;
    costs: Cost[];
    alasan_penolakan: string | null;
    alasan_pembatalan: string | null;
    created_by: string | null;
    created_at: string | null;
    disetujui_at: string | null;
    selesai_at: string | null;
    dibatalkan_at: string | null;
    approver: string | null;
};

type Actions = {
    canEdit: boolean;
    locked: boolean;
    canDelete: boolean;
    canSubmit: boolean;
    canCancel: boolean;
};

export default function TripsShow({ trip, actions }: { trip: Trip; actions: Actions }) {
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [showCancel, setShowCancel] = useState(false);
    const cancelForm = useForm({ alasan_pembatalan: '' });

    function submitTrip() {
        router.post(`/perjalanan/${trip.id}/ajukan`, {}, { preserveScroll: true });
    }

    function destroy() {
        router.delete(`/perjalanan/${trip.id}`);
    }

    function cancel(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        cancelForm.post(`/perjalanan/${trip.id}/batalkan`, {
            preserveScroll: true,
            onSuccess: () => {
                cancelForm.reset();
                setShowCancel(false);
            },
        });
    }

    const riwayat = [
        { label: 'Perjalanan dibuat', at: trip.created_at, note: trip.created_by },
        trip.disetujui_at ? { label: 'Disetujui', at: trip.disetujui_at, note: trip.approver } : null,
        trip.selesai_at ? { label: 'Ditandai selesai', at: trip.selesai_at, note: null } : null,
        trip.dibatalkan_at ? { label: 'Dibatalkan', at: trip.dibatalkan_at, note: null } : null,
    ].filter((item): item is { label: string; at: string; note: string | null } => item !== null);

    return (
        <AppLayout>
            <Head title={trip.maksud} />
            <Flash />

            <PageHeader
                title={trip.maksud}
                description={`${trip.pegawai.name} · ${trip.unit}`}
                actions={
                    <>
                        {actions.canSubmit ? (
                            <button type="button" onClick={submitTrip} className={btnPrimary}>
                                Ajukan ke pejabat
                            </button>
                        ) : null}
                        {actions.canEdit ? (
                            <Link href={`/perjalanan/${trip.id}/edit`} className={btnSecondary}>
                                Ubah
                            </Link>
                        ) : null}
                        {actions.canCancel ? (
                            <button
                                type="button"
                                onClick={() => setShowCancel((open) => !open)}
                                className={btnDanger}
                                aria-expanded={showCancel}
                                aria-controls="form-pembatalan"
                            >
                                Batalkan
                            </button>
                        ) : null}
                    </>
                }
            />

            <div className="mb-4 flex flex-wrap items-center gap-3">
                <StatusBadge status={trip.status} label={trip.status_label} />
                <p className="text-sm text-muted">
                    {trip.nomor_sppd ? `SPPD ${trip.nomor_sppd}` : 'Nomor SPPD belum terbit'}
                </p>
            </div>

            {trip.alasan_penolakan ? (
                <div role="alert" className="mb-4 rounded-sm border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">
                    <p className="font-semibold">Alasan penolakan</p>
                    <p className="mt-1">{trip.alasan_penolakan}</p>
                </div>
            ) : null}

            {trip.alasan_pembatalan ? (
                <div role="alert" className="mb-4 rounded-sm border border-line bg-paper px-4 py-3 text-sm text-muted">
                    <p className="font-semibold text-ink">Alasan pembatalan</p>
                    <p className="mt-1">{trip.alasan_pembatalan}</p>
                </div>
            ) : null}

            {showCancel ? (
                <form
                    id="form-pembatalan"
                    onSubmit={cancel}
                    className={`${cardClass} mb-4 p-4`}
                >
                    <label htmlFor="alasan_pembatalan" className={labelClass}>
                        Alasan pembatalan
                    </label>
                    <textarea
                        id="alasan_pembatalan"
                        rows={3}
                        value={cancelForm.data.alasan_pembatalan}
                        onChange={(event) => cancelForm.setData('alasan_pembatalan', event.target.value)}
                        className={`${inputClass} min-h-24`}
                        required
                    />
                    {cancelForm.errors.alasan_pembatalan ? (
                        <p className={errorClass} role="alert">{cancelForm.errors.alasan_pembatalan}</p>
                    ) : null}
                    <div className="mt-3 flex flex-wrap gap-2">
                        <button type="submit" disabled={cancelForm.processing} className={btnDanger}>
                            {cancelForm.processing ? 'Membatalkan...' : 'Konfirmasi pembatalan'}
                        </button>
                        <button type="button" onClick={() => setShowCancel(false)} className={btnSecondary}>
                            Tidak jadi
                        </button>
                    </div>
                </form>
            ) : null}

            <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
                <div className="space-y-4">
                    <section className={`${cardClass} p-5`}>
                        <h2 className="font-display text-2xl text-ink">Data perjalanan</h2>
                        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                            {[
                                ['Tempat tujuan', trip.tempat_tujuan],
                                ['Lama perjalanan', `${trip.lama_hari} hari`],
                                ['Tanggal mulai', formatDate(trip.tanggal_mulai)],
                                ['Tanggal selesai', formatDate(trip.tanggal_selesai)],
                                ['Alat angkut', trip.alat_angkut],
                                ['Sumber dana', trip.sumber_dana],
                            ].map(([label, value]) => (
                                <div key={label}>
                                    <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</dt>
                                    <dd className="mt-0.5 text-sm text-ink">{value}</dd>
                                </div>
                            ))}
                        </dl>

                        {trip.catatan ? (
                            <div className="mt-5 border-t border-line pt-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Catatan</p>
                                <p className="mt-1 whitespace-pre-line text-sm text-ink">{trip.catatan}</p>
                            </div>
                        ) : null}
                    </section>

                    <section className={`${cardClass} p-5`}>
                        <h2 className="font-display text-2xl text-ink">Rincian biaya</h2>

                        {trip.costs.length === 0 ? (
                            <p className="mt-3 rounded-sm border border-dashed border-line bg-paper px-4 py-5 text-center text-sm text-muted">
                                Belum ada rincian biaya untuk perjalanan ini.
                            </p>
                        ) : (
                            <>
                                <div className="mt-4 space-y-3 sm:hidden">
                                    {trip.costs.map((cost) => (
                                        <div key={cost.id} className="rounded-sm border border-line p-3">
                                            <p className="font-semibold text-ink">{cost.jenis_biaya}</p>
                                            <p className="mt-0.5 text-xs text-muted">
                                                {cost.jumlah} x {formatRupiah(cost.tarif)}
                                            </p>
                                            {cost.keterangan ? (
                                                <p className="mt-1 text-sm text-muted">{cost.keterangan}</p>
                                            ) : null}
                                            <p className="mt-2 text-sm font-semibold text-ink">{formatRupiah(cost.subtotal)}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-4 hidden overflow-x-auto sm:block">
                                    <table className="w-full border-collapse text-left text-sm">
                                        <caption className="sr-only">Rincian biaya perjalanan</caption>
                                        <thead>
                                            <tr className="border-b border-line text-xs uppercase tracking-wide text-muted">
                                                <th scope="col" className="py-2 pr-3 font-semibold">Jenis</th>
                                                <th scope="col" className="px-3 py-2 font-semibold">Keterangan</th>
                                                <th scope="col" className="px-3 py-2 text-right font-semibold">Jumlah</th>
                                                <th scope="col" className="px-3 py-2 text-right font-semibold">Tarif</th>
                                                <th scope="col" className="py-2 pl-3 text-right font-semibold">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-line">
                                            {trip.costs.map((cost) => (
                                                <tr key={cost.id}>
                                                    <td className="py-2 pr-3 text-ink">{cost.jenis_biaya}</td>
                                                    <td className="px-3 py-2 text-muted">{cost.keterangan ?? '-'}</td>
                                                    <td className="px-3 py-2 text-right text-ink">{cost.jumlah}</td>
                                                    <td className="px-3 py-2 text-right text-ink">{formatRupiah(cost.tarif)}</td>
                                                    <td className="py-2 pl-3 text-right font-semibold text-ink">
                                                        {formatRupiah(cost.subtotal)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <p className="mt-4 flex flex-wrap items-baseline justify-between gap-2 border-t border-line pt-3">
                                    <span className="text-sm font-medium text-muted">Total biaya</span>
                                    <span className="font-display text-2xl text-ink">{formatRupiah(trip.total_biaya)}</span>
                                </p>
                            </>
                        )}
                    </section>
                </div>

                <div className="space-y-4">
                    <section className={`${cardClass} p-5`}>
                        <h2 className="font-display text-2xl text-ink">Pegawai</h2>
                        <p className="mt-3 font-semibold text-ink">{trip.pegawai.name}</p>
                        <dl className="mt-2 space-y-1 text-sm">
                            <div className="flex flex-wrap justify-between gap-2">
                                <dt className="text-muted">NIP</dt>
                                <dd className="text-ink">{trip.pegawai.nip ?? '-'}</dd>
                            </div>
                            <div className="flex flex-wrap justify-between gap-2">
                                <dt className="text-muted">Jabatan</dt>
                                <dd className="text-right text-ink">{trip.pegawai.jabatan ?? '-'}</dd>
                            </div>
                            <div className="flex flex-wrap justify-between gap-2">
                                <dt className="text-muted">Golongan</dt>
                                <dd className="text-ink">{trip.pegawai.golongan ?? '-'}</dd>
                            </div>
                            <div className="flex flex-wrap justify-between gap-2">
                                <dt className="text-muted">Unit kerja</dt>
                                <dd className="text-right text-ink">{trip.pegawai.unit ?? trip.unit}</dd>
                            </div>
                        </dl>
                    </section>

                    <section className={`${cardClass} p-5`}>
                        <h2 className="font-display text-2xl text-ink">Riwayat</h2>
                        <ol className="mt-3 space-y-3">
                            {riwayat.map((item) => (
                                <li key={`${item.label}-${item.at}`} className="border-l-2 border-line pl-3">
                                    <p className="text-sm font-semibold text-ink">{item.label}</p>
                                    <p className="text-xs text-muted">{formatDateTime(item.at)}</p>
                                    {item.note ? <p className="text-xs text-muted">{item.note}</p> : null}
                                </li>
                            ))}
                        </ol>
                        <p className="mt-4 border-t border-line pt-3 text-sm text-muted">
                            Status saat ini: <span className="font-semibold text-ink">{trip.status_label}</span>
                        </p>
                    </section>

                    {actions.canDelete ? (
                        <section className={`${cardClass} p-5`}>
                            <h2 className="font-display text-2xl text-ink">Hapus draft</h2>
                            <p className="mt-1 text-sm text-muted">
                                Draft yang dihapus tidak dapat dikembalikan. Perjalanan yang sudah diajukan hanya dapat
                                dibatalkan.
                            </p>
                            {confirmDelete ? (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <button type="button" onClick={destroy} className={btnDanger}>
                                        Yakin hapus permanen
                                    </button>
                                    <button type="button" onClick={() => setConfirmDelete(false)} className={btnSecondary}>
                                        Batal
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setConfirmDelete(true)}
                                    className={`${btnDanger} mt-3`}
                                >
                                    Hapus perjalanan
                                </button>
                            )}
                        </section>
                    ) : null}
                </div>
            </div>
        </AppLayout>
    );
}
