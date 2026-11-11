import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Flash from '@/components/Flash';
import PageHeader from '@/components/PageHeader';
import { btnDanger, btnPrimary, btnSecondary, cardClass, errorClass, inputClass, labelClass } from '@/lib/styles';

type Unit = {
    id: number;
    kode: string;
    nama: string;
    users_count: number;
    trips_count: number;
};

export default function UnitsIndex({ units }: { units: Unit[] }) {
    const [confirming, setConfirming] = useState<number | null>(null);
    const { data, setData, post, processing, errors, reset } = useForm({
        kode: '',
        nama: '',
    });

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        post('/unit', {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    }

    function destroy(unit: Unit) {
        router.delete(`/unit/${unit.id}`, {
            preserveScroll: true,
            onFinish: () => setConfirming(null),
        });
    }

    return (
        <AppLayout>
            <Head title="Unit kerja" />
            <Flash />
            <PageHeader
                title="Unit kerja"
                description="Unit dipakai untuk mengelompokkan pegawai, kalender, dan laporan perjalanan."
            />

            <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
                <div
                    tabIndex={0}
                    role="region"
                    aria-labelledby="unit-caption"
                    className={`${cardClass} relative overflow-x-auto`}
                >
                    <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
                        <caption id="unit-caption" className="sr-only">
                            Daftar unit kerja
                        </caption>
                        <thead>
                            <tr className="border-b border-line text-xs uppercase tracking-wide text-muted">
                                <th scope="col" className="px-4 py-3 font-semibold">Kode</th>
                                <th scope="col" className="px-4 py-3 font-semibold">Nama unit</th>
                                <th scope="col" className="px-4 py-3 font-semibold">Pegawai</th>
                                <th scope="col" className="px-4 py-3 font-semibold">Perjalanan</th>
                                <th scope="col" className="px-4 py-3 font-semibold">
                                    <span className="sr-only">Tindakan</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-line">
                            {units.map((unit) => (
                                <tr key={unit.id} className="transition-colors hover:bg-paper/60">
                                    <td className="px-4 py-3 font-semibold text-ink whitespace-nowrap">{unit.kode}</td>
                                    <td className="px-4 py-3 text-ink">{unit.nama}</td>
                                    <td className="px-4 py-3 text-muted tabular-nums">{unit.users_count}</td>
                                    <td className="px-4 py-3 text-muted tabular-nums">{unit.trips_count}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-end gap-2">
                                            <Link
                                                href={`/unit/${unit.id}/edit`}
                                                className="inline-flex min-h-11 items-center rounded-sm px-2 text-sm font-semibold text-accent underline underline-offset-2"
                                            >
                                                Ubah
                                                <span className="sr-only"> unit {unit.nama}</span>
                                            </Link>
                                            {confirming === unit.id ? (
                                                <>
                                                    <button type="button" onClick={() => destroy(unit)} className={btnDanger}>
                                                        Yakin hapus
                                                    </button>
                                                    <button type="button" onClick={() => setConfirming(null)} className={btnSecondary}>
                                                        Batal
                                                    </button>
                                                </>
                                            ) : (
                                                <button type="button" onClick={() => setConfirming(unit.id)} className={btnDanger}>
                                                    Hapus
                                                    <span className="sr-only"> unit {unit.nama}</span>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {units.length === 0 ? (
                        <p className="px-4 py-6 text-center text-sm text-muted">
                            Belum ada unit kerja. Tambahkan unit pertama di formulir sebelah.
                        </p>
                    ) : null}
                </div>

                <form onSubmit={submit} className={`${cardClass} p-5`}>
                    <h2 className="font-display text-2xl text-ink">Tambah unit</h2>
                    <div className="mt-4 space-y-4">
                        <div>
                            <label htmlFor="kode" className={labelClass}>Kode unit</label>
                            <input
                                id="kode"
                                value={data.kode}
                                onChange={(event) => setData('kode', event.target.value.toUpperCase())}
                                className={inputClass}
                                placeholder="Contoh: BID-A"
                                required
                            />
                            {errors.kode ? <p className={errorClass} role="alert">{errors.kode}</p> : null}
                        </div>
                        <div>
                            <label htmlFor="nama" className={labelClass}>Nama unit</label>
                            <input
                                id="nama"
                                value={data.nama}
                                onChange={(event) => setData('nama', event.target.value)}
                                className={inputClass}
                                required
                            />
                            {errors.nama ? <p className={errorClass} role="alert">{errors.nama}</p> : null}
                        </div>
                    </div>
                    <button type="submit" disabled={processing} className={`${btnPrimary} mt-5 w-full`}>
                        {processing ? 'Menyimpan...' : 'Tambah unit'}
                    </button>
                </form>
            </div>
        </AppLayout>
    );
}
