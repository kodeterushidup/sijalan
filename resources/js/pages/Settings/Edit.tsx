import { Head, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Flash from '@/components/Flash';
import PageHeader from '@/components/PageHeader';
import { btnDanger, btnPrimary, btnSecondary, cardClass, errorClass, inputClass, labelClass } from '@/lib/styles';

type Setting = {
    nama_instansi: string;
    alamat: string | null;
    format_nomor: string;
    nama_pejabat: string | null;
    nip_pejabat: string | null;
    logo_url: string | null;
};

export default function SettingsEdit({ setting }: { setting: Setting }) {
    const [logoPreview, setLogoPreview] = useState<string | null>(setting.logo_url);
    const { data, setData, patch, processing, errors, isDirty, reset } = useForm<{
        nama_instansi: string;
        alamat: string;
        format_nomor: string;
        nama_pejabat: string;
        nip_pejabat: string;
        logo: File | null;
        remove_logo: boolean;
    }>({
        nama_instansi: setting.nama_instansi,
        alamat: setting.alamat ?? '',
        format_nomor: setting.format_nomor,
        nama_pejabat: setting.nama_pejabat ?? '',
        nip_pejabat: setting.nip_pejabat ?? '',
        logo: null,
        remove_logo: false,
    });

    const nomorContoh = useMemo(() => {
        return (data.format_nomor || '090/SPPD/{urut}/{kode_unit}/{tahun}')
            .replaceAll('{urut}', '007')
            .replaceAll('{kode_unit}', 'SEK')
            .replaceAll('{tahun}', String(new Date().getFullYear()));
    }, [data.format_nomor]);

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        patch('/pengaturan', {
            forceFormData: true,
            preserveScroll: true,
        });
    }

    function pilihLogo(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0] ?? null;
        setData('logo', file);
        setData('remove_logo', false);

        if (logoPreview && logoPreview.startsWith('blob:')) {
            URL.revokeObjectURL(logoPreview);
        }

        setLogoPreview(file ? URL.createObjectURL(file) : setting.logo_url);
    }

    function hapusLogo() {
        setData('logo', null);
        setData('remove_logo', true);
        setLogoPreview(null);
    }

    return (
        <AppLayout>
            <Head title="Pengaturan instansi" />
            <Flash />
            <PageHeader
                title="Pengaturan instansi"
                description="Identitas ini muncul pada SPPD, laporan perjalanan, dan halaman cetak."
            />

            <form onSubmit={submit} className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
                <section className={`${cardClass} p-5 sm:p-6`}>
                    <h2 className="font-display text-2xl text-ink">Identitas instansi</h2>

                    <div className="mt-5 space-y-5">
                        <div>
                            <label htmlFor="nama_instansi" className={labelClass}>
                                Nama instansi
                            </label>
                            <input
                                id="nama_instansi"
                                value={data.nama_instansi}
                                onChange={(event) => setData('nama_instansi', event.target.value)}
                                className={inputClass}
                                required
                            />
                            {errors.nama_instansi ? (
                                <p className={errorClass} role="alert">
                                    {errors.nama_instansi}
                                </p>
                            ) : null}
                        </div>

                        <div>
                            <label htmlFor="alamat" className={labelClass}>
                                Alamat
                            </label>
                            <textarea
                                id="alamat"
                                rows={3}
                                value={data.alamat}
                                onChange={(event) => setData('alamat', event.target.value)}
                                className={`${inputClass} min-h-24`}
                            />
                            {errors.alamat ? (
                                <p className={errorClass} role="alert">
                                    {errors.alamat}
                                </p>
                            ) : null}
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <label htmlFor="nama_pejabat" className={labelClass}>
                                    Nama pejabat penandatangan
                                </label>
                                <input
                                    id="nama_pejabat"
                                    value={data.nama_pejabat}
                                    onChange={(event) => setData('nama_pejabat', event.target.value)}
                                    className={inputClass}
                                />
                                {errors.nama_pejabat ? (
                                    <p className={errorClass} role="alert">
                                        {errors.nama_pejabat}
                                    </p>
                                ) : null}
                            </div>

                            <div>
                                <label htmlFor="nip_pejabat" className={labelClass}>
                                    NIP pejabat
                                </label>
                                <input
                                    id="nip_pejabat"
                                    inputMode="numeric"
                                    maxLength={18}
                                    value={data.nip_pejabat}
                                    onChange={(event) =>
                                        setData('nip_pejabat', event.target.value.replace(/\D/g, ''))
                                    }
                                    className={inputClass}
                                />
                                {errors.nip_pejabat ? (
                                    <p className={errorClass} role="alert">
                                        {errors.nip_pejabat}
                                    </p>
                                ) : null}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-wrap gap-2 border-t border-line pt-5">
                        <button type="submit" disabled={processing || !isDirty} className={btnPrimary}>
                            {processing ? 'Menyimpan...' : 'Simpan pengaturan'}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                reset();
                                setLogoPreview(setting.logo_url);
                            }}
                            disabled={processing || !isDirty}
                            className={btnSecondary}
                        >
                            Batalkan perubahan
                        </button>
                    </div>
                    {!isDirty ? (
                        <p className="mt-2 text-xs text-muted">
                            Belum ada perubahan yang perlu disimpan.
                        </p>
                    ) : null}
                </section>

                <div className="space-y-4">
                    <section className={`${cardClass} p-5 sm:p-6`}>
                        <h2 className="font-display text-2xl text-ink">Logo instansi</h2>
                        <p className="mt-1 text-sm text-muted">
                            PNG atau JPG, maksimal 2 MB. Logo dipakai pada kop dokumen.
                        </p>

                        {logoPreview ? (
                            <div className="mt-4 flex min-h-28 items-center justify-center rounded-sm border border-line bg-white p-4">
                                <img
                                    src={logoPreview}
                                    alt={`Logo ${data.nama_instansi}`}
                                    className="max-h-20 w-auto max-w-full object-contain"
                                />
                            </div>
                        ) : (
                            <p className="mt-4 rounded-sm border border-dashed border-line bg-paper px-4 py-6 text-center text-sm text-muted">
                                Belum ada logo. Dokumen tetap dicetak tanpa kop gambar.
                            </p>
                        )}

                        <div className="mt-4">
                            <label htmlFor="logo" className={labelClass}>
                                Berkas logo
                            </label>
                            <input
                                id="logo"
                                type="file"
                                accept="image/png,image/jpeg"
                                onChange={pilihLogo}
                                className={inputClass}
                            />
                            {errors.logo ? (
                                <p className={errorClass} role="alert">
                                    {errors.logo}
                                </p>
                            ) : null}
                        </div>

                        {logoPreview ? (
                            <button type="button" onClick={hapusLogo} className={`${btnDanger} mt-3`}>
                                Hapus logo
                            </button>
                        ) : null}
                    </section>

                    <section className={`${cardClass} p-5 sm:p-6`}>
                        <h2 className="font-display text-2xl text-ink">Format nomor SPPD</h2>
                        <div className="mt-4">
                            <label htmlFor="format_nomor" className={labelClass}>
                                Pola penomoran
                            </label>
                            <input
                                id="format_nomor"
                                value={data.format_nomor}
                                onChange={(event) => setData('format_nomor', event.target.value)}
                                className={inputClass}
                                required
                            />
                            <p className="mt-1 text-xs text-muted">
                                Gunakan penanda {'{urut}'}, {'{kode_unit}'}, dan {'{tahun}'}.
                            </p>
                            {errors.format_nomor ? (
                                <p className={errorClass} role="alert">
                                    {errors.format_nomor}
                                </p>
                            ) : null}
                        </div>

                        <div className="mt-4 rounded-sm border border-line bg-paper px-4 py-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                                Contoh nomor
                            </p>
                            <p className="mt-1 break-all font-display text-xl text-ink">{nomorContoh}</p>
                        </div>
                    </section>
                </div>
            </form>
        </AppLayout>
    );
}
