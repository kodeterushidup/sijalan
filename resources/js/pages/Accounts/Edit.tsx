import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/components/AppLayout';
import Flash from '@/components/Flash';
import PageHeader from '@/components/PageHeader';
import { btnPrimary, btnSecondary, cardClass, errorClass, inputClass, labelClass } from '@/lib/styles';

type RoleOption = { value: string; label: string };

type Account = {
    id: number;
    name: string;
    email: string;
    role: string;
    is_active: boolean;
};

export default function AccountsEdit({
    account,
    roles,
}: {
    account: Account;
    roles: RoleOption[];
}) {
    const { data, setData, patch, processing, errors } = useForm({
        name: account.name,
        email: account.email,
        role: account.role,
        is_active: account.is_active,
        password: '',
        password_confirmation: '',
    });

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        patch(`/akun/${account.id}`);
    }

    return (
        <AppLayout>
            <Head title={`Ubah akun ${account.name}`} />
            <Flash />
            <PageHeader
                title="Ubah akun"
                description="Peran dan status aktif berlaku pada percobaan masuk berikutnya."
            />

            <form onSubmit={submit} className={`${cardClass} max-w-2xl p-5 sm:p-6`}>
                <div className="space-y-5">
                    <div>
                        <label htmlFor="name" className={labelClass}>Nama lengkap</label>
                        <input
                            id="name"
                            value={data.name}
                            onChange={(event) => setData('name', event.target.value)}
                            className={inputClass}
                            required
                        />
                        {errors.name ? <p className={errorClass} role="alert">{errors.name}</p> : null}
                    </div>

                    <div>
                        <label htmlFor="email" className={labelClass}>Email</label>
                        <input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(event) => setData('email', event.target.value)}
                            className={inputClass}
                            required
                        />
                        {errors.email ? <p className={errorClass} role="alert">{errors.email}</p> : null}
                    </div>

                    <div>
                        <label htmlFor="role" className={labelClass}>Peran</label>
                        <select
                            id="role"
                            value={data.role}
                            onChange={(event) => setData('role', event.target.value)}
                            className={inputClass}
                        >
                            {roles.map((role) => (
                                <option key={role.value} value={role.value}>{role.label}</option>
                            ))}
                        </select>
                        {errors.role ? <p className={errorClass} role="alert">{errors.role}</p> : null}
                    </div>

                    <label className="flex items-center gap-3 text-sm text-ink">
                        <input
                            type="checkbox"
                            checked={data.is_active}
                            onChange={(event) => setData('is_active', event.target.checked)}
                            className="size-5 rounded-sm border-line"
                        />
                        Akun aktif dan boleh masuk
                    </label>

                    <div className="grid gap-5 border-t border-line pt-5 sm:grid-cols-2">
                        <div>
                            <label htmlFor="password" className={labelClass}>Kata sandi baru</label>
                            <input
                                id="password"
                                type="password"
                                autoComplete="new-password"
                                value={data.password}
                                onChange={(event) => setData('password', event.target.value)}
                                className={inputClass}
                            />
                            <p className="mt-1 text-xs text-muted">Kosongkan bila tidak ingin mengubah.</p>
                            {errors.password ? <p className={errorClass} role="alert">{errors.password}</p> : null}
                        </div>
                        <div>
                            <label htmlFor="password_confirmation" className={labelClass}>Ulangi kata sandi baru</label>
                            <input
                                id="password_confirmation"
                                type="password"
                                autoComplete="new-password"
                                value={data.password_confirmation}
                                onChange={(event) => setData('password_confirmation', event.target.value)}
                                className={inputClass}
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-2">
                    <button type="submit" disabled={processing} className={btnPrimary}>
                        {processing ? 'Menyimpan...' : 'Simpan perubahan'}
                    </button>
                    <Link href="/akun" className={btnSecondary}>Batal</Link>
                </div>
            </form>
        </AppLayout>
    );
}
