import { Head, Link } from '@inertiajs/react';
import { btnPrimary, btnSecondary } from '@/lib/styles';
import { formatDate, formatRupiah } from '@/lib/format';

type Cost = {
    id: number;
    jenis_biaya: string;
    keterangan: string | null;
    jumlah: number;
    tarif: number;
    subtotal: number;
};

type Sppd = {
    id: number;
    nomor_sppd: string | null;
    maksud: string;
    tempat_tujuan: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
    lama_hari: number;
    alat_angkut: string;
    sumber_dana: string;
    pegawai: {
        name: string;
        nip: string | null;
        jabatan: string | null;
        golongan: string | null;
        unit: string | null;
    };
    total_biaya: number;
    costs: Cost[];
};

type Instansi = {
    nama: string;
    alamat: string | null;
    logo_url: string | null;
};

type PenandaTangan = {
    nama: string | null;
    nip: string | null;
    ttd_url: string | null;
};

export default function SppdPrint({
    trip,
    instansi,
    penandaTangan,
    dicetak,
}: {
    trip: Sppd;
    instansi: Instansi;
    penandaTangan: PenandaTangan;
    dicetak: string;
}) {
    const rows: [string, string][] = [
        ['Nama', trip.pegawai.name],
        ['NIP', trip.pegawai.nip ?? '-'],
        ['Jabatan', trip.pegawai.jabatan ?? '-'],
        ['Golongan', trip.pegawai.golongan ?? '-'],
        ['Unit kerja', trip.pegawai.unit ?? '-'],
    ];

    const detail: [string, string][] = [
        ['Maksud perjalanan', trip.maksud],
        ['Tempat tujuan', trip.tempat_tujuan],
        ['Tanggal mulai', formatDate(trip.tanggal_mulai)],
        ['Tanggal selesai', formatDate(trip.tanggal_selesai)],
        ['Lama perjalanan', `${trip.lama_hari} hari`],
        ['Alat angkut', trip.alat_angkut],
        ['Sumber dana', trip.sumber_dana],
    ];

    return (
        <div className="min-h-screen bg-paper px-4 py-6 print:min-h-0 print:bg-white print:p-0">
            <Head title={`SPPD ${trip.nomor_sppd ?? ''}`} />

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
                    Surat Perintah Perjalanan Dinas
                </h1>
                <p className="mt-1 text-center text-sm">Nomor: {trip.nomor_sppd}</p>

                <p className="mt-6 text-sm leading-relaxed">
                    Yang bertanda tangan di bawah ini memberi perintah perjalanan dinas kepada:
                </p>

                <dl className="mt-2 grid grid-cols-[9rem_1fr] gap-x-3 gap-y-1 text-sm">
                    {rows.map(([label, value]) => (
                        <div key={label} className="contents">
                            <dt className="font-semibold">{label}</dt>
                            <dd>: {value}</dd>
                        </div>
                    ))}
                </dl>

                <p className="mt-5 text-sm leading-relaxed">Untuk melaksanakan perjalanan dinas dengan rincian:</p>

                <dl className="mt-2 grid grid-cols-[9rem_1fr] gap-x-3 gap-y-1 text-sm">
                    {detail.map(([label, value]) => (
                        <div key={label} className="contents">
                            <dt className="font-semibold">{label}</dt>
                            <dd>: {value}</dd>
                        </div>
                    ))}
                </dl>

                <table className="mt-6 w-full border-collapse text-sm">
                    <caption className="mb-2 text-left font-semibold">Rincian biaya</caption>
                    <thead>
                        <tr className="border border-black bg-black/5">
                            <th scope="col" className="border border-black px-2 py-1.5 text-left font-semibold">Jenis biaya</th>
                            <th scope="col" className="border border-black px-2 py-1.5 text-left font-semibold">Keterangan</th>
                            <th scope="col" className="border border-black px-2 py-1.5 text-right font-semibold">Jumlah</th>
                            <th scope="col" className="border border-black px-2 py-1.5 text-right font-semibold">Tarif</th>
                            <th scope="col" className="border border-black px-2 py-1.5 text-right font-semibold">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {trip.costs.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="border border-black px-2 py-3 text-center">
                                    Belum ada rincian biaya.
                                </td>
                            </tr>
                        ) : (
                            trip.costs.map((cost) => (
                                <tr key={cost.id}>
                                    <td className="border border-black px-2 py-1.5">{cost.jenis_biaya}</td>
                                    <td className="border border-black px-2 py-1.5">{cost.keterangan ?? '-'}</td>
                                    <td className="border border-black px-2 py-1.5 text-right">{cost.jumlah}</td>
                                    <td className="border border-black px-2 py-1.5 text-right">{formatRupiah(cost.tarif)}</td>
                                    <td className="border border-black px-2 py-1.5 text-right">{formatRupiah(cost.subtotal)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                    <tfoot>
                        <tr>
                            <th scope="row" colSpan={4} className="border border-black px-2 py-1.5 text-right font-semibold">
                                Total biaya
                            </th>
                            <td className="border border-black px-2 py-1.5 text-right font-semibold">
                                {formatRupiah(trip.total_biaya)}
                            </td>
                        </tr>
                    </tfoot>
                </table>

                <div className="mt-10 ml-auto w-72 text-center text-sm">
                    <p>
                        Dicetak di {instansi.nama} pada {dicetak}
                    </p>
                    <p className="mt-3 font-semibold">Pejabat Penyetuju</p>
                    <div className="flex h-24 items-center justify-center">
                        {penandaTangan.ttd_url ? (
                            <img src={penandaTangan.ttd_url} alt="" className="max-h-24 object-contain" />
                        ) : null}
                    </div>
                    <p className="font-semibold underline">{penandaTangan.nama ?? '................................'}</p>
                    <p>NIP {penandaTangan.nip ?? '-'}</p>
                </div>
            </article>
        </div>
    );
}
