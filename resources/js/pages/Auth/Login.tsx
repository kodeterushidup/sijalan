import { Head, useForm } from '@inertiajs/react';
import { errorClass, inputClass, labelClass, btnPrimary } from '@/lib/styles';

type DemoAccount = {
    role: string;
    email: string;
};

export default function Login({ demoAccounts }: { demoAccounts: DemoAccount[] }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        post('/login', {
            onFinish: () => reset('password'),
        });
    }

    function fillDemo(account: DemoAccount) {
        setData({
            email: account.email,
            password: 'password',
            remember: false,
        });
    }

    return (
        <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
            <Head title="Masuk" />

            <section className="hidden flex-col justify-between bg-ink p-10 lg:flex lg:p-14">
                <div>
                    <p className="font-display text-3xl leading-none tracking-wide text-white">SIJALAN</p>
                    <p className="mt-1 text-sm text-white/70">Sistem Perjalanan Dinas</p>
                </div>

                <div className="max-w-lg">
                    <p className="font-display text-5xl leading-tight text-white">
                        Perjalanan dinas, SPPD, dan laporan dalam satu arsip.
                    </p>
                    <p className="mt-5 text-sm leading-relaxed text-white/75">
                        Kalender perjalanan per pegawai dan unit, penomoran surat yang konsisten, serta
                        kelengkapan laporan dan dokumentasi setelah perjalanan.
                    </p>
                </div>

                <p className="text-xs text-white/60">Akses hanya untuk pegawai yang terdaftar.</p>
            </section>

            <main className="flex items-center justify-center px-4 py-10 sm:px-8">
                <div className="w-full max-w-md">
                    <div className="mb-8 lg:hidden">
                        <p className="font-display text-3xl leading-none tracking-wide text-ink">SIJALAN</p>
                        <p className="mt-1 text-sm text-muted">Sistem Perjalanan Dinas</p>
                    </div>

                    <h1 className="font-display text-4xl text-ink">Masuk</h1>
                    <p className="mt-1 text-sm text-muted">
                        Gunakan email dan kata sandi yang diberikan Admin Kepegawaian.
                    </p>

                    <form onSubmit={submit} className="mt-8 space-y-5">
                        <div>
                            <label htmlFor="email" className={labelClass}>
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                autoComplete="username"
                                required
                                value={data.email}
                                onChange={(event) => setData('email', event.target.value)}
                                className={inputClass}
                                aria-invalid={Boolean(errors.email)}
                                aria-describedby={errors.email ? 'email-error' : undefined}
                            />
                            {errors.email ? (
                                <p id="email-error" role="alert" className={errorClass}>
                                    {errors.email}
                                </p>
                            ) : null}
                        </div>

                        <div>
                            <label htmlFor="password" className={labelClass}>
                                Kata sandi
                            </label>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                autoComplete="current-password"
                                required
                                value={data.password}
                                onChange={(event) => setData('password', event.target.value)}
                                className={inputClass}
                                aria-invalid={Boolean(errors.password)}
                                aria-describedby={errors.password ? 'password-error' : undefined}
                            />
                            {errors.password ? (
                                <p id="password-error" role="alert" className={errorClass}>
                                    {errors.password}
                                </p>
                            ) : null}
                        </div>

                        <label className="flex items-center gap-3 text-sm text-ink">
                            <input
                                type="checkbox"
                                checked={data.remember}
                                onChange={(event) => setData('remember', event.target.checked)}
                                className="size-5 rounded-sm border-line text-accent focus:ring-accent"
                            />
                            Ingat saya di perangkat ini
                        </label>

                        <button type="submit" disabled={processing} className={`${btnPrimary} w-full`}>
                            {processing ? 'Memeriksa...' : 'Masuk'}
                        </button>
                    </form>

                    {demoAccounts.length > 0 ? (
                        <div className="mt-8 rounded-md border border-line bg-surface p-4">
                            <p className="text-sm font-semibold text-ink">Akun demo lingkungan lokal</p>
                            <p className="mt-1 text-xs text-muted">
                                Pilih peran untuk mengisi email. Kata sandi semua akun: password.
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {demoAccounts.map((account) => (
                                    <button
                                        key={account.email}
                                        type="button"
                                        onClick={() => fillDemo(account)}
                                        className="inline-flex min-h-11 items-center rounded-sm border border-line bg-paper px-3 text-sm font-medium text-ink transition-colors hover:border-ink-soft"
                                    >
                                        {account.role}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : null}
                </div>
            </main>
        </div>
    );
}
