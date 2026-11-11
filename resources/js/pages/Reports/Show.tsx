import { Head, Link } from '@inertiajs/react';
import { btnPrimary, btnSecondary } from '@/lib/styles';
import { formatDate } from '@/lib/format';

type Trip = {
    id: number;
    nomor_sppd: string | null;
    maksud: string;
    tempat_tujuan: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
    lama_hari: number;
    disetujui_at: string | null;
};

type Report = {
    hasil: string;
    kendala: string;
    rekomendasi: string;
    disusun_at: string | null;
};

type Pegawai = {
    name: string;
    nip: string | null;
    jabatan: string | null;
    golongan: string | null;
    unit: string | null;
    ttd_url: string | null;
};

type Photo = {
    id: number;
    url: string;
    is_image: boolean;
    keterangan: string | null;
};

type Instansi = {
    nama: string;
    alamat: string | null;
    logo_url: string | null;
};

export default function ReportsShow({
    trip,
    report,
    pegawai,
    photos,
    instansi,
    dicetak,
}: {
    trip: Trip;
    report: Report;
    pegawai: Pegawai;
    photos: Photo[];
    instansi: Instansi;
    dicetak: string;
}) {
    const identity: [string, string][] = [
        ['Nama', pegawai.name],
        ['NIP', pegawai.nip ?? '-'],
        ['Jabatan', pegawai.jabatan ?? '-'],
        ['Golongan', pegawai.golongan ?? '-'],
        ['Unit kerja', pegawai.unit ?? '-'],
    ];

    const detail: [string, string][] = [
        ['Nomor SPPD', trip.nomor_sppd ?? '-'],
        ['Maksud perjalanan', trip.maksud],
        ['Tempat tujuan', trip.tempat_tujuan],
        ['Tanggal pelaksanaan', `${formatDate(trip.tanggal_mulai)} sampai ${formatDate(trip.tanggal_selesai)}`],
        ['Lama perjalanan', `${trip.lama_hari} hari`],
    ];

    return (
        <div className="min-h-screen bg-paper px-4 py-6 print:min-h-0 print:bg-white print:p-0">
            <Head title={`Laporan ${trip.maksud}`} />

            <div className="no-print mx-auto mb-5 flex max-w-3xl flex-wrap items-center justify-between gap-2">
                <Link href={`/perjalanan/${trip.id}`} className={btnSecondary}>
                    Kembali ke detail
                </Link>
                <button type="button" onClick={() => window.print()} className={btnPrimary}>
                    Cetak / Simpan PDF
                </button>
            </div>

            <article className="mx-auto max-w-3xl bg-surface p-8 text-black shadow-sm print:max-w-none print:bg-white print:p-0 print:shadow-none">
                <header className="border-b-4 border-double border-black pb-3">
                    <div className="flex items-center gap-4">
                        {instansi.logo_url ? (
                            <img src={instansi.logo_url} alt="" className="h-16 w-16 shrink-0 object-contain" />
                        ) : null}
                        <div className="flex-1 text-center">
                            <p className="font-display text-2xl uppercase tracking-wide">{instansi.nama}</p>
                            {instansi.alamat ? <p className="mt-1 text-xs leading-snug">{instansi.alamat}</p> : null}
                        </div>
                    </div>
                </header>

                <h1 className="mt-6 text-center font-display text-xl font-semibold uppercase tracking-wide underline">
                    Laporan Perjalanan Dinas
                </h1>
                <p className="mt-1 text-center text-sm">Nomor SPPD: {trip.nomor_sppd ?? '-'}</p>

                <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                    {[...identity, ...detail].map(([label, value]) => (
                        <div key={label} className="contents">
                            <dt className="font-semibold">{label}</dt>
                            <dd>: {value}</dd>
                        </div>
                    ))}
                </dl>

                <section className="mt-6">
                    <h2 className="font-semibold uppercase">A. Uraian hasil</h2>
                    <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-pretty">{report.hasil}</p>
                </section>

                <section className="mt-5">
                    <h2 className="font-semibold uppercase">B. Kendala</h2>
                    <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-pretty">{report.kendala}</p>
                </section>

                <section className="mt-5">
                    <h2 className="font-semibold uppercase">C. Rekomendasi dan tindak lanjut</h2>
                    <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-pretty">{report.rekomendasi}</p>
                </section>

                <section className="mt-5">
                    <h2 className="font-semibold uppercase">Lampiran dokumentasi</h2>
                    {photos.length === 0 ? (
                        <p className="mt-1 text-sm">Tidak ada berkas dokumentasi.</p>
                    ) : (
                        <ol className="mt-1 list-decimal space-y-1 pl-5 text-sm">
                            {photos.map((photo, index) => (
                                <li key={photo.id}>
                                    {photo.keterangan?.trim() ? photo.keterangan : `Dokumentasi ${index + 1}`}
                                    {photo.is_image ? '' : ' (PDF)'}
                                </li>
                            ))}
                        </ol>
                    )}
                </section>

                <div className="mt-10 ml-auto w-72 text-center text-sm">
                    <p className="text-pretty">
                        Dicetak di {instansi.nama} pada{' '}
                        <span className="whitespace-nowrap">{dicetak}</span>
                    </p>
                    <p className="mt-3 font-semibold">Pegawai yang melaksanakan</p>
                    <div className="flex h-24 items-center justify-center">
                        {pegawai.ttd_url ? (
                            <img src={pegawai.ttd_url} alt="" className="max-h-24 object-contain" />
                        ) : null}
                    </div>
                    <p className="font-semibold underline">{pegawai.name}</p>
                    <p>NIP {pegawai.nip ?? '-'}</p>
                </div>
            </article>
        </div>
    );
}
