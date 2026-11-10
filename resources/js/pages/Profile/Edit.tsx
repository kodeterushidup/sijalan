import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/components/AppLayout';
import Flash from '@/components/Flash';
import PageHeader from '@/components/PageHeader';
import { btnDanger, btnPrimary, cardClass, errorClass, inputClass, labelClass } from '@/lib/styles';

type Profile = {
    name: string;
    email: string;
    no_hp: string | null;
    jabatan: string | null;
    golongan: string | null;
    unit: string | null;
    role_label: string;
    has_ttd: boolean;
    ttd_url: string | null;
};

export default function ProfileEdit({ profile }: { profile: Profile }) {
    const form = useForm({
        name: profile.name,
        no_hp: profile.no_hp ?? '',
    });

    const ttdForm = useForm<{ ttd: File | null }>({ ttd: null });

    function submitProfile(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.patch('/profil', { preserveScroll: true });
    }

    function submitTtd(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        ttdForm.post('/profil/ttd', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => ttdForm.reset(),
        });
    }

    function removeTtd() {
        router.delete('/profil/ttd', { preserveScroll: true });
    }

    return (
        <AppLayout>
            <Head title="Profil" />
            <Flash />
            <PageHeader
                title="Profil"
                description="Data ini dipakai pada dokumen perjalanan dinas. Pastikan nama dan tanda tangan sesuai."
            />

            <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
                <form onSubmit={submitProfile} className={`${cardClass} p-5 sm:p-6`}>
                    <h2 className="font-display text-2xl text-ink">Data akun</h2>

                    <div className="mt-5 space-y-5">
                        <div>
                            <label htmlFor="name" className={labelClass}>Nama lengkap</label>
                            <input
                                id="name"
                                value={form.data.name}
                                onChange={(event) => form.setData('name', event.target.value)}
                                className={inputClass}
                                required
                            />
                            {form.errors.name ? <p className={errorClass} role="alert">{form.errors.name}</p> : null}
                        </div>

                        <div>
                            <label htmlFor="no_hp" className={labelClass}>Nomor HP</label>
                            <input
                                id="no_hp"
                                value={form.data.no_hp}
                                onChange={(event) => form.setData('no_hp', event.target.value)}
                                className={inputClass}
                                inputMode="tel"
                            />
                            {form.errors.no_hp ? <p className={errorClass} role="alert">{form.errors.no_hp}</p> : null}
                        </div>

                        <dl className="space-y-2 border-t border-line pt-4 text-sm">
                            {[
                                ['Email', profile.email],
                                ['Peran', profile.role_label],
                                ['Jabatan', profile.jabatan ?? '-'],
                                ['Golongan', profile.golongan ?? '-'],
                                ['Unit kerja', profile.unit ?? '-'],
                            ].map(([label, value]) => (
                                <div key={label} className="flex flex-wrap justify-between gap-2">
                                    <dt className="text-muted">{label}</dt>
                                    <dd className="text-right font-medium text-ink">{value}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2">
                        <button type="submit" disabled={form.processing} className={btnPrimary}>
                            {form.processing ? 'Menyimpan...' : 'Simpan profil'}
                        </button>
                    </div>
                </form>

                <section className={`${cardClass} p-5 sm:p-6`}>
                    <h2 className="font-display text-2xl text-ink">Tanda tangan</h2>
                    <p className="mt-1 text-sm text-muted">
                        Unggah gambar tanda tangan dengan latar putih atau transparan. Dipakai pada SPPD dan laporan.
                    </p>

                    {profile.has_ttd && profile.ttd_url ? (
                        <div className="mt-5 rounded-sm border border-line bg-white p-3">
                            <img
                                src={profile.ttd_url}
                                alt={`Tanda tangan ${profile.name}`}
                                width={320}
                                height={120}
                                className="h-auto max-h-32 w-full max-w-xs object-contain"
                            />
                        </div>
                    ) : (
                        <p className="mt-5 rounded-sm border border-dashed border-line bg-paper px-4 py-6 text-center text-sm text-muted">
                            Belum ada tanda tangan. Dokumen tetap dapat dicetak, tetapi kolom tanda tangan akan kosong.
                        </p>
                    )}

                    <form onSubmit={submitTtd} className="mt-5 space-y-3">
                        <div>
                            <label htmlFor="ttd" className={labelClass}>Berkas tanda tangan</label>
                            <input
                                id="ttd"
                                type="file"
                                accept="image/png,image/jpeg"
                                onChange={(event) => ttdForm.setData('ttd', event.target.files?.[0] ?? null)}
                                className={inputClass}
                            />
                            <p className="mt-1 text-xs text-muted">PNG atau JPG, maksimal 1 MB.</p>
                            {ttdForm.errors.ttd ? <p className={errorClass} role="alert">{ttdForm.errors.ttd}</p> : null}
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <button
                                type="submit"
                                disabled={ttdForm.processing || !ttdForm.data.ttd}
                                className={btnPrimary}
                            >
                                {ttdForm.processing ? 'Mengunggah...' : 'Unggah tanda tangan'}
                            </button>
                            {profile.has_ttd ? (
                                <button type="button" onClick={removeTtd} className={btnDanger}>
                                    Hapus tanda tangan
                                </button>
                            ) : null}
                        </div>
                    </form>
                </section>
            </div>
        </AppLayout>
    );
}
