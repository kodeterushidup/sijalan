import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/components/AppLayout';
import Flash from '@/components/Flash';
import PageHeader from '@/components/PageHeader';
import { btnPrimary, btnSecondary, cardClass, errorClass, inputClass, labelClass } from '@/lib/styles';

export default function UnitsEdit({
    unit,
}: {
    unit: { id: number; kode: string; nama: string };
}) {
    const { data, setData, patch, processing, errors } = useForm({
        kode: unit.kode,
        nama: unit.nama,
    });

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        patch(`/unit/${unit.id}`);
    }

    return (
        <AppLayout>
            <Head title={`Ubah unit ${unit.nama}`} />
            <Flash />
            <PageHeader title="Ubah unit kerja" />

            <form onSubmit={submit} className={`${cardClass} max-w-xl p-5 sm:p-6`}>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="kode" className={labelClass}>Kode unit</label>
                        <input
                            id="kode"
                            value={data.kode}
                            onChange={(event) => setData('kode', event.target.value.toUpperCase())}
                            className={inputClass}
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

                <div className="mt-6 flex flex-wrap gap-2">
                    <button type="submit" disabled={processing} className={btnPrimary}>
                        {processing ? 'Menyimpan...' : 'Simpan perubahan'}
                    </button>
                    <Link href="/unit" className={btnSecondary}>Batal</Link>
                </div>
            </form>
        </AppLayout>
    );
}
