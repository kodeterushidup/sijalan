import { useForm } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { btnPrimary, btnSecondary, cardClass, errorClass, inputClass, labelClass } from '@/lib/styles';

type UnitOption = { value: number; label: string };

export type EmployeeValues = {
    name: string;
    nip: string;
    jabatan: string;
    golongan: string;
    unit_id: string;
    email: string;
    no_hp: string;
    password: string;
    password_confirmation: string;
    is_active: boolean;
};

export default function EmployeeForm({
    employee,
    units,
    mode,
}: {
    employee?: {
        id: number;
        name: string;
        nip: string;
        jabatan: string | null;
        golongan: string | null;
        unit_id: number | null;
        email: string;
        no_hp: string | null;
        is_active: boolean;
    };
    units: UnitOption[];
    mode: 'create' | 'edit';
}) {
    const { data, setData, post, patch, processing, errors } = useForm<EmployeeValues>({
        name: employee?.name ?? '',
        nip: employee?.nip ?? '',
        jabatan: employee?.jabatan ?? '',
        golongan: employee?.golongan ?? '',
        unit_id: employee?.unit_id ? String(employee.unit_id) : units[0] ? String(units[0].value) : '',
        email: employee?.email ?? '',
        no_hp: employee?.no_hp ?? '',
        password: '',
        password_confirmation: '',
        is_active: employee?.is_active ?? true,
    });

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (mode === 'create') {
            post('/pegawai');
        } else if (employee) {
            patch(`/pegawai/${employee.id}`);
        }
    }

    return (
        <form onSubmit={submit} className={`${cardClass} max-w-3xl p-5 sm:p-6`}>
            <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
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
                    <label htmlFor="nip" className={labelClass}>NIP</label>
                    <input
                        id="nip"
                        inputMode="numeric"
                        maxLength={18}
                        value={data.nip}
                        onChange={(event) => setData('nip', event.target.value.replace(/\D/g, ''))}
                        className={inputClass}
                        required
                    />
                    <p className="mt-1 text-xs text-muted">18 digit angka.</p>
                    {errors.nip ? <p className={errorClass} role="alert">{errors.nip}</p> : null}
                </div>

                <div>
                    <label htmlFor="unit_id" className={labelClass}>Unit kerja</label>
                    <select
                        id="unit_id"
                        value={data.unit_id}
                        onChange={(event) => setData('unit_id', event.target.value)}
                        className={inputClass}
                        required
                    >
                        <option value="">Pilih unit kerja</option>
                        {units.map((unit) => (
                            <option key={unit.value} value={unit.value}>{unit.label}</option>
                        ))}
                    </select>
                    {errors.unit_id ? <p className={errorClass} role="alert">{errors.unit_id}</p> : null}
                </div>

                <div>
                    <label htmlFor="jabatan" className={labelClass}>Jabatan</label>
                    <input
                        id="jabatan"
                        value={data.jabatan}
                        onChange={(event) => setData('jabatan', event.target.value)}
                        className={inputClass}
                    />
                    {errors.jabatan ? <p className={errorClass} role="alert">{errors.jabatan}</p> : null}
                </div>

                <div>
                    <label htmlFor="golongan" className={labelClass}>Golongan</label>
                    <input
                        id="golongan"
                        value={data.golongan}
                        onChange={(event) => setData('golongan', event.target.value)}
                        className={inputClass}
                        placeholder="Contoh: III/b"
                    />
                    {errors.golongan ? <p className={errorClass} role="alert">{errors.golongan}</p> : null}
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
                    <label htmlFor="no_hp" className={labelClass}>Nomor HP</label>
                    <input
                        id="no_hp"
                        inputMode="tel"
                        value={data.no_hp}
                        onChange={(event) => setData('no_hp', event.target.value)}
                        className={inputClass}
                    />
                    {errors.no_hp ? <p className={errorClass} role="alert">{errors.no_hp}</p> : null}
                </div>

                <div>
                    <label htmlFor="password" className={labelClass}>
                        {mode === 'create' ? 'Kata sandi awal' : 'Kata sandi baru'}
                    </label>
                    <input
                        id="password"
                        type="password"
                        autoComplete="new-password"
                        value={data.password}
                        onChange={(event) => setData('password', event.target.value)}
                        className={inputClass}
                        required={mode === 'create'}
                    />
                    {mode === 'edit' ? <p className="mt-1 text-xs text-muted">Kosongkan bila tidak diubah.</p> : null}
                    {errors.password ? <p className={errorClass} role="alert">{errors.password}</p> : null}
                </div>

                <div>
                    <label htmlFor="password_confirmation" className={labelClass}>Ulangi kata sandi</label>
                    <input
                        id="password_confirmation"
                        type="password"
                        autoComplete="new-password"
                        value={data.password_confirmation}
                        onChange={(event) => setData('password_confirmation', event.target.value)}
                        className={inputClass}
                        required={mode === 'create'}
                    />
                </div>
            </div>

            {mode === 'edit' ? (
                <label className="mt-5 flex items-center gap-3 text-sm text-ink">
                    <input
                        type="checkbox"
                        checked={data.is_active}
                        onChange={(event) => setData('is_active', event.target.checked)}
                        className="size-5 rounded-sm border-line"
                    />
                    Pegawai aktif
                </label>
            ) : null}

            <div className="mt-8 flex flex-wrap gap-2">
                <button type="submit" disabled={processing} className={btnPrimary}>
                    {processing ? 'Menyimpan...' : 'Simpan pegawai'}
                </button>
                <Link href="/pegawai" className={btnSecondary}>Batal</Link>
            </div>
        </form>
    );
}
