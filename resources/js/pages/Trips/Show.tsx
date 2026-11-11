import { Head, Link, router, useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
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

type Photo = {
    id: number;
    url: string;
    is_image: boolean;
    keterangan: string | null;
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
    report: { disusun_at: string | null } | null;
    photos: Photo[];
};

type Actions = {
    canEdit: boolean;
    locked: boolean;
    canDelete: boolean;
    canSubmit: boolean;
    canCancel: boolean;
    canApprove: boolean;
    canReject: boolean;
    canPrintSppd: boolean;
    canWriteReport: boolean;
    canUploadPhotos: boolean;
    canComplete: boolean;
    canPrintReport: boolean;
};

type Completion = {
    has_report: boolean;
    photo_count: number;
    end_passed: boolean;
};

export default function TripsShow({
    trip,
    actions,
    completion,
}: {
    trip: Trip;
    actions: Actions;
    completion: Completion;
}) {
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [showCancel, setShowCancel] = useState(false);
    const [showReject, setShowReject] = useState(false);
    const cancelForm = useForm({ alasan_pembatalan: '' });
    const rejectForm = useForm({ alasan_penolakan: '' });
    const rejectStatusError = (rejectForm.errors as Partial<Record<string, string>>).status;
    const photoForm = useForm<{ photos: File[]; keterangan: string[] }>({ photos: [], keterangan: [] });
    const photoErrors = photoForm.errors as Partial<Record<string, string>>;
    const fileInput = useRef<HTMLInputElement>(null);

    function approve() {
        router.post(`/perjalanan/${trip.id}/setujui`, {}, { preserveScroll: true });
    }

    function reject(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        rejectForm.post(`/perjalanan/${trip.id}/tolak`, {
            preserveScroll: true,
            onSuccess: () => {
                rejectForm.reset();
                setShowReject(false);
            },
        });
    }

    function selectPhotos(files: FileList | null) {
        const list = files ? Array.from(files) : [];
        photoForm.setData({ photos: list, keterangan: list.map(() => '') });
    }

    function setCaption(index: number, value: string) {
        photoForm.setData(
            'keterangan',
            photoForm.data.keterangan.map((caption, position) => (position === index ? value : caption)),
        );
    }

    function uploadPhotos(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        photoForm.post(`/perjalanan/${trip.id}/dokumentasi`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                photoForm.reset();
                if (fileInput.current) {
                    fileInput.current.value = '';
                }
            },
        });
    }

    function deletePhoto(photo: Photo) {
        router.delete(`/perjalanan/${trip.id}/dokumentasi/${photo.id}`, { preserveScroll: true });
    }

    function completeTrip() {
        router.post(`/perjalanan/${trip.id}/selesai`, {}, { preserveScroll: true });
    }

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

    const completionReady = completion.has_report && completion.photo_count > 0 && completion.end_passed;

    return (
        <AppLayout>
            <Head title={trip.maksud} />
            <Flash />

            <PageHeader
                title={trip.maksud}
                description={`${trip.pegawai.name} · ${trip.unit}`}
                actions={
                    <>
                        {actions.canPrintSppd ? (
                            <Link href={`/perjalanan/${trip.id}/sppd`} className={btnSecondary}>
                                Cetak SPPD
                            </Link>
                        ) : null}
                        {actions.canPrintReport ? (
                            <Link href={`/perjalanan/${trip.id}/laporan`} className={btnSecondary}>
                                Cetak laporan
                            </Link>
                        ) : null}
                        {actions.canApprove ? (
                            <button type="button" onClick={approve} className={btnPrimary}>
                                Setujui
                            </button>
                        ) : null}
                        {actions.canReject ? (
                            <button
                                type="button"
                                onClick={() => setShowReject((open) => !open)}
                                className={btnDanger}
                                aria-expanded={showReject}
                                aria-controls="form-penolakan"
                            >
                                Tolak
                            </button>
                        ) : null}
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

            {showReject ? (
                <form id="form-penolakan" onSubmit={reject} className={`${cardClass} mb-4 p-4`}>
                    <label htmlFor="alasan_penolakan" className={labelClass}>
                        Alasan penolakan
                    </label>
                    <p className="mb-2 mt-1 text-sm text-muted">
                        Alasan akan terlihat oleh Admin Kepegawaian yang dapat memperbaiki lalu mengajukan ulang.
                    </p>
                    <textarea
                        id="alasan_penolakan"
                        rows={3}
                        value={rejectForm.data.alasan_penolakan}
                        onChange={(event) => rejectForm.setData('alasan_penolakan', event.target.value)}
                        className={`${inputClass} min-h-24`}
                        required
                    />
                    {rejectForm.errors.alasan_penolakan ? (
                        <p className={errorClass} role="alert">{rejectForm.errors.alasan_penolakan}</p>
                    ) : null}
                    {rejectStatusError ? (
                        <p className={errorClass} role="alert">{rejectStatusError}</p>
                    ) : null}
                    <div className="mt-3 flex flex-wrap gap-2">
                        <button type="submit" disabled={rejectForm.processing} className={btnDanger}>
                            {rejectForm.processing ? 'Menolak...' : 'Konfirmasi penolakan'}
                        </button>
                        <button type="button" onClick={() => setShowReject(false)} className={btnSecondary}>
                            Tidak jadi
                        </button>
                    </div>
                </form>
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
                                            <p className="mt-0.5 text-xs text-muted tabular-nums">
                                                {cost.jumlah} x {formatRupiah(cost.tarif)}
                                            </p>
                                            {cost.keterangan ? (
                                                <p className="mt-1 text-sm text-muted">{cost.keterangan}</p>
                                            ) : null}
                                            <p className="mt-2 text-sm font-semibold text-ink tabular-nums">{formatRupiah(cost.subtotal)}</p>
                                        </div>
                                    ))}
                                </div>

                                <div
                                    tabIndex={0}
                                    role="region"
                                    aria-labelledby="rincian-biaya-caption"
                                    className="relative mt-4 hidden overflow-x-auto sm:block"
                                >
                                    <table className="w-full border-collapse text-left text-sm">
                                        <caption id="rincian-biaya-caption" className="sr-only">
                                            Rincian biaya perjalanan
                                        </caption>
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
                                                    <td className="px-3 py-2 text-right text-ink tabular-nums">{cost.jumlah}</td>
                                                    <td className="px-3 py-2 text-right text-ink tabular-nums">{formatRupiah(cost.tarif)}</td>
                                                    <td className="py-2 pl-3 text-right font-semibold text-ink tabular-nums">
                                                        {formatRupiah(cost.subtotal)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <p className="mt-4 flex flex-wrap items-baseline justify-between gap-2 border-t border-line pt-3">
                                    <span className="text-sm font-medium text-muted">Total biaya</span>
                                    <span className="font-display text-2xl text-ink tabular-nums">{formatRupiah(trip.total_biaya)}</span>
                                </p>
                            </>
                        )}
                    </section>

                    <section className={`${cardClass} p-5`}>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <h2 className="font-display text-2xl text-ink">Laporan perjalanan</h2>
                            {actions.canPrintReport ? (
                                <Link href={`/perjalanan/${trip.id}/laporan`} className={btnSecondary}>
                                    Cetak laporan
                                </Link>
                            ) : null}
                        </div>

                        {trip.report ? (
                            <>
                                <p className="mt-3 text-sm text-muted">
                                    Disusun {formatDateTime(trip.report.disusun_at)}.
                                </p>
                                {actions.canWriteReport ? (
                                    <Link href={`/perjalanan/${trip.id}/laporan/isi`} className={`${btnSecondary} mt-3`}>
                                        Ubah laporan
                                    </Link>
                                ) : null}
                            </>
                        ) : (
                            <>
                                <p className="mt-3 text-sm text-muted">
                                    {actions.canWriteReport
                                        ? 'Laporan belum diisi. Lengkapi sebelum perjalanan ditandai selesai oleh Admin.'
                                        : 'Laporan belum diisi oleh pegawai yang melaksanakan perjalanan.'}
                                </p>
                                {actions.canWriteReport ? (
                                    <Link href={`/perjalanan/${trip.id}/laporan/isi`} className={`${btnPrimary} mt-3`}>
                                        Isi laporan
                                    </Link>
                                ) : null}
                            </>
                        )}
                    </section>

                    <section className={`${cardClass} p-5`}>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <h2 className="font-display text-2xl text-ink">Dokumentasi</h2>
                            <p className="text-sm text-muted">{trip.photos.length} dari 10 berkas</p>
                        </div>

                        {trip.photos.length === 0 ? (
                            <p className="mt-3 rounded-sm border border-dashed border-line bg-paper px-4 py-5 text-center text-sm text-muted">
                                Belum ada foto atau berkas dokumentasi.
                            </p>
                        ) : (
                            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                                {trip.photos.map((photo) => (
                                    <li key={photo.id}>
                                        <a
                                            href={photo.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="block overflow-hidden rounded-sm border border-line"
                                        >
                                            {photo.is_image ? (
                                                <img
                                                    src={photo.url}
                                                    alt={photo.keterangan ?? 'Dokumentasi perjalanan'}
                                                    className="h-24 w-full object-cover"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <span className="flex h-24 w-full items-center justify-center bg-paper text-sm font-semibold text-ink">
                                                    Berkas PDF
                                                </span>
                                            )}
                                        </a>
                                        <p className="mt-1 text-xs text-muted">
                                            {photo.keterangan?.trim() ? photo.keterangan : 'Tanpa keterangan'}
                                        </p>
                                        {actions.canUploadPhotos ? (
                                            <button
                                                type="button"
                                                onClick={() => deletePhoto(photo)}
                                                className="mt-1 inline-flex min-h-11 items-center text-xs font-semibold text-danger underline underline-offset-2"
                                            >
                                                Hapus berkas
                                            </button>
                                        ) : null}
                                    </li>
                                ))}
                            </ul>
                        )}

                        {actions.canUploadPhotos && trip.photos.length < 10 ? (
                            <form onSubmit={uploadPhotos} className="mt-4 border-t border-line pt-4">
                                <label htmlFor="photos" className={labelClass}>Tambah dokumentasi</label>
                                <input
                                    ref={fileInput}
                                    id="photos"
                                    type="file"
                                    multiple
                                    accept=".jpg,.jpeg,.png,.pdf"
                                    onChange={(event) => selectPhotos(event.target.files)}
                                    className={inputClass}
                                />
                                <p className="mt-1 text-xs text-muted">
                                    JPG, PNG, atau PDF. Maksimal 5 MB per berkas dan 10 berkas per perjalanan.
                                </p>

                                {photoForm.data.photos.length > 0 ? (
                                    <ul className="mt-3 space-y-3">
                                        {photoForm.data.photos.map((file, index) => (
                                            <li key={`${file.name}-${index}`}>
                                                <p className="truncate text-sm font-medium text-ink">{file.name}</p>
                                                <label htmlFor={`keterangan-${index}`} className="sr-only">
                                                    Keterangan untuk {file.name}
                                                </label>
                                                <input
                                                    id={`keterangan-${index}`}
                                                    type="text"
                                                    maxLength={150}
                                                    value={photoForm.data.keterangan[index] ?? ''}
                                                    onChange={(event) => setCaption(index, event.target.value)}
                                                    placeholder="Keterangan opsional"
                                                    className={`${inputClass} mt-1`}
                                                />
                                            </li>
                                        ))}
                                    </ul>
                                ) : null}

                                {Object.keys(photoErrors).length > 0 ? (
                                    <p className={errorClass} role="alert">{Object.values(photoErrors)[0]}</p>
                                ) : null}

                                <button
                                    type="submit"
                                    disabled={photoForm.processing || photoForm.data.photos.length === 0}
                                    className={`${btnPrimary} mt-3`}
                                >
                                    {photoForm.processing ? 'Mengunggah...' : 'Unggah dokumentasi'}
                                </button>
                            </form>
                        ) : null}
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

                    {actions.canComplete ? (
                        <section className={`${cardClass} p-5`}>
                            <h2 className="font-display text-2xl text-ink">Verifikasi pemberkasan</h2>
                            <p className="mt-1 text-sm text-muted">
                                Perjalanan dapat ditandai selesai setelah semua syarat terpenuhi.
                            </p>
                            <ul className="mt-3 space-y-2 text-sm">
                                {[
                                    { done: completion.has_report, label: 'Laporan perjalanan terisi' },
                                    {
                                        done: completion.photo_count > 0,
                                        label: `Dokumentasi minimal satu berkas (${completion.photo_count} tersedia)`,
                                    },
                                    { done: completion.end_passed, label: 'Tanggal selesai sudah lewat' },
                                ].map((item) => (
                                    <li key={item.label} className="flex gap-2">
                                        <span className={item.done ? 'font-semibold text-success' : 'font-semibold text-danger'} aria-hidden="true">
                                            {item.done ? '✓' : '×'}
                                        </span>
                                        <span className={item.done ? 'text-ink' : 'text-muted'}>
                                            <span className="sr-only">{item.done ? 'Terpenuhi: ' : 'Belum terpenuhi: '}</span>
                                            {item.label}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                            <button
                                type="button"
                                onClick={completeTrip}
                                disabled={!completionReady}
                                className={`${btnPrimary} mt-4`}
                            >
                                Tandai selesai
                            </button>
                            {!completionReady ? (
                                <p className="mt-2 text-xs text-muted">Lengkapi syarat di atas untuk mengaktifkan tombol ini.</p>
                            ) : null}
                        </section>
                    ) : null}

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
