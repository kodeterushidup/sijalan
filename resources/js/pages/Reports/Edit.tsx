import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/components/AppLayout';
import Flash from '@/components/Flash';
import PageHeader from '@/components/PageHeader';
import { formatDate } from '@/lib/format';
import { btnPrimary, btnSecondary, cardClass, errorClass, inputClass, labelClass } from '@/lib/styles';

type Trip = {
    id: number;
    nomor_sppd: string | null;
    maksud: string;
    tempat_tujuan: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
};

type Report = {
    hasil: string;
    kendala: string;
    rekomendasi: string;
    disusun_at: string | null;
};

export default function ReportsEdit({ trip, report }: { trip: Trip; report: Report }) {
    const form = useForm({
        hasil: report.hasil,
        kendala: report.kendala,
        rekomendasi: report.rekomendasi,
    });

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.patch(`/perjalanan/${trip.id}/laporan`, { preserveScroll: true });
    }

    return (
        <AppLayout>
            <Head title={`Laporan ${trip.maksud}`} />
            <Flash />
            <PageHeader
                title="Laporan perjalanan"
                description={`${trip.maksud} · ${trip.tempat_tujuan} · ${formatDate(trip.tanggal_mulai)} sampai ${formatDate(trip.tanggal_selesai)}`}
            />

            <form onSubmit={submit} className={`${cardClass} max-w-3xl p-5 sm:p-6`}>
                <p className="rounded-sm border border-line bg-paper px-4 py-3 text-sm text-muted">
                    {trip.nomor_sppd ? `SPPD ${trip.nomor_sppd}. ` : ''}
                    Laporan dapat diubah selama perjalanan belum ditandai selesai oleh Admin Kepegawaian.
                </p>

                <div className="mt-5 space-y-5">
                    <div>
                        <label htmlFor="hasil" className={labelClass}>Uraian hasil</label>
                        <p className="mb-1.5 text-sm text-muted">
                            Apa yang dikerjakan dan apa hasilnya. Sebutkan pihak yang ditemui bila relevan.
                        </p>
                        <textarea
                            id="hasil"
                            rows={6}
                            value={form.data.hasil}
                            onChange={(event) => form.setData('hasil', event.target.value)}
                            className={`${inputClass} min-h-40`}
                            required
                        />
                        {form.errors.hasil ? <p className={errorClass} role="alert">{form.errors.hasil}</p> : null}
                    </div>

                    <div>
                        <label htmlFor="kendala" className={labelClass}>Kendala</label>
                        <p className="mb-1.5 text-sm text-muted">
                            Hambatan selama perjalanan. Tulis "Tidak ada kendala" bila semuanya lancar.
                        </p>
                        <textarea
                            id="kendala"
                            rows={4}
                            value={form.data.kendala}
                            onChange={(event) => form.setData('kendala', event.target.value)}
                            className={`${inputClass} min-h-28`}
                            required
                        />
                        {form.errors.kendala ? <p className={errorClass} role="alert">{form.errors.kendala}</p> : null}
                    </div>

                    <div>
                        <label htmlFor="rekomendasi" className={labelClass}>Rekomendasi dan tindak lanjut</label>
                        <p className="mb-1.5 text-sm text-muted">
                            Langkah berikutnya yang perlu diambil unit kerja atau instansi.
                        </p>
                        <textarea
                            id="rekomendasi"
                            rows={4}
                            value={form.data.rekomendasi}
                            onChange={(event) => form.setData('rekomendasi', event.target.value)}
                            className={`${inputClass} min-h-28`}
                            required
                        />
                        {form.errors.rekomendasi ? <p className={errorClass} role="alert">{form.errors.rekomendasi}</p> : null}
                    </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                    <button type="submit" disabled={form.processing} className={btnPrimary}>
                        {form.processing ? 'Menyimpan...' : 'Simpan laporan'}
                    </button>
                    <Link href={`/perjalanan/${trip.id}`} className={btnSecondary}>
                        Kembali ke detail
                    </Link>
                </div>
            </form>
        </AppLayout>
    );
}
