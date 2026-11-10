import { Link, useForm } from '@inertiajs/react';
import { useRef } from 'react';
import { btnPrimary, btnSecondary, cardClass, errorClass, inputClass, labelClass } from '@/lib/styles';
import { formatRupiah } from '@/lib/format';

type EmployeeOption = { value: number; label: string };

export type CostValues = {
    jenis_biaya: string;
    keterangan: string;
    jumlah: string;
    tarif: string;
};

export type TripValues = {
    user_id: string;
    maksud: string;
    tempat_tujuan: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
    alat_angkut: string;
    sumber_dana: string;
    catatan: string;
    costs: CostValues[];
};

export const emptyCost = (): CostValues => ({
    jenis_biaya: '',
    keterangan: '',
    jumlah: '1',
    tarif: '',
});

function toValues(trip?: {
    user_id: number;
    maksud: string;
    tempat_tujuan: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
    alat_angkut: string;
    sumber_dana: string;
    catatan: string | null;
    costs: { jenis_biaya: string; keterangan: string | null; jumlah: number; tarif: number }[];
}): TripValues {
    if (!trip) {
        return {
            user_id: '',
            maksud: '',
            tempat_tujuan: '',
            tanggal_mulai: '',
            tanggal_selesai: '',
            alat_angkut: 'Darat',
            sumber_dana: '',
            catatan: '',
            costs: [emptyCost()],
        };
    }

    return {
        user_id: String(trip.user_id),
        maksud: trip.maksud,
        tempat_tujuan: trip.tempat_tujuan,
        tanggal_mulai: trip.tanggal_mulai,
        tanggal_selesai: trip.tanggal_selesai,
        alat_angkut: trip.alat_angkut,
        sumber_dana: trip.sumber_dana,
        catatan: trip.catatan ?? '',
        costs: trip.costs.length > 0
            ? trip.costs.map((cost) => ({
                  jenis_biaya: cost.jenis_biaya,
                  keterangan: cost.keterangan ?? '',
                  jumlah: String(cost.jumlah),
                  tarif: String(cost.tarif),
              }))
            : [emptyCost()],
    };
}

function lamaHari(mulai: string, selesai: string): number {
    if (!mulai || !selesai) {
        return 0;
    }

    const start = new Date(`${mulai}T00:00:00`);
    const end = new Date(`${selesai}T00:00:00`);
    const days = Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1;

    return days > 0 ? days : 0;
}

export default function TripForm({
    mode,
    trip,
    employees,
    alatAngkut,
    defaults,
}: {
    mode: 'create' | 'edit';
    trip?: {
        id: number;
        user_id: number;
        maksud: string;
        tempat_tujuan: string;
        tanggal_mulai: string;
        tanggal_selesai: string;
        alat_angkut: string;
        sumber_dana: string;
        catatan: string | null;
        status?: string;
        costs: { jenis_biaya: string; keterangan: string | null; jumlah: number; tarif: number }[];
    };
    employees: EmployeeOption[];
    alatAngkut: string[];
    defaults?: { tanggal_mulai?: string; unit?: string };
}) {
    const initial = toValues(trip);

    if (mode === 'create' && defaults?.tanggal_mulai) {
        initial.tanggal_mulai = defaults.tanggal_mulai;
        initial.tanggal_selesai = defaults.tanggal_mulai;
    }

    const form = useForm<TripValues>(initial);
    const intent = useRef<'draft' | 'diajukan'>('draft');
    const canSubmit = mode === 'create' || ['draft', 'ditolak'].includes(trip?.status ?? '');

    const total = form.data.costs.reduce(
        (sum, cost) => sum + Number(cost.jumlah || 0) * Number(cost.tarif || 0),
        0,
    );
    const hari = lamaHari(form.data.tanggal_mulai, form.data.tanggal_selesai);

    function updateCost(index: number, key: keyof CostValues, value: string) {
        const next = form.data.costs.map((cost, position) =>
            position === index ? { ...cost, [key]: value } : cost,
        );
        form.setData('costs', next);
    }

    function addCost() {
        form.setData('costs', [...form.data.costs, emptyCost()]);
    }

    function removeCost(index: number) {
        const next = form.data.costs.filter((_, position) => position !== index);
        form.setData('costs', next.length > 0 ? next : [emptyCost()]);
    }

    function save(status: 'draft' | 'diajukan') {
        intent.current = status;
        form.transform((data) => ({ ...data, status: intent.current }));

        if (mode === 'create') {
            form.post('/perjalanan');
        } else if (trip) {
            form.patch(`/perjalanan/${trip.id}`);
        }
    }

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        save('draft');
    }

    return (
        <form onSubmit={submit} className="space-y-4">
            <section className={`${cardClass} p-5 sm:p-6`}>
                <h2 className="font-display text-2xl text-ink">Data perjalanan</h2>

                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                        <label htmlFor="user_id" className={labelClass}>Pegawai yang bertugas</label>
                        <select
                            id="user_id"
                            value={form.data.user_id}
                            onChange={(event) => form.setData('user_id', event.target.value)}
                            className={inputClass}
                            required
                        >
                            <option value="">Pilih pegawai</option>
                            {employees.map((employee) => (
                                <option key={employee.value} value={employee.value}>
                                    {employee.label}
                                </option>
                            ))}
                        </select>
                        <p className="mt-1 text-xs text-muted">
                            Unit kerja mengikuti data pegawai yang dipilih.
                        </p>
                        {form.errors.user_id ? (
                            <p className={errorClass} role="alert">{form.errors.user_id}</p>
                        ) : null}
                    </div>

                    <div className="sm:col-span-2">
                        <label htmlFor="maksud" className={labelClass}>Maksud perjalanan</label>
                        <input
                            id="maksud"
                            value={form.data.maksud}
                            onChange={(event) => form.setData('maksud', event.target.value)}
                            className={inputClass}
                            placeholder="Contoh: Menghadiri Rapat Koordinasi Perencanaan"
                            required
                        />
                        {form.errors.maksud ? (
                            <p className={errorClass} role="alert">{form.errors.maksud}</p>
                        ) : null}
                    </div>

                    <div>
                        <label htmlFor="tempat_tujuan" className={labelClass}>Tempat tujuan</label>
                        <input
                            id="tempat_tujuan"
                            value={form.data.tempat_tujuan}
                            onChange={(event) => form.setData('tempat_tujuan', event.target.value)}
                            className={inputClass}
                            required
                        />
                        {form.errors.tempat_tujuan ? (
                            <p className={errorClass} role="alert">{form.errors.tempat_tujuan}</p>
                        ) : null}
                    </div>

                    <div>
                        <label htmlFor="alat_angkut" className={labelClass}>Alat angkut</label>
                        <select
                            id="alat_angkut"
                            value={form.data.alat_angkut}
                            onChange={(event) => form.setData('alat_angkut', event.target.value)}
                            className={inputClass}
                        >
                            {alatAngkut.map((option) => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                        {form.errors.alat_angkut ? (
                            <p className={errorClass} role="alert">{form.errors.alat_angkut}</p>
                        ) : null}
                    </div>

                    <div>
                        <label htmlFor="tanggal_mulai" className={labelClass}>Tanggal mulai</label>
                        <input
                            id="tanggal_mulai"
                            type="date"
                            value={form.data.tanggal_mulai}
                            onChange={(event) => form.setData('tanggal_mulai', event.target.value)}
                            className={inputClass}
                            required
                        />
                        {form.errors.tanggal_mulai ? (
                            <p className={errorClass} role="alert">{form.errors.tanggal_mulai}</p>
                        ) : null}
                    </div>

                    <div>
                        <label htmlFor="tanggal_selesai" className={labelClass}>Tanggal selesai</label>
                        <input
                            id="tanggal_selesai"
                            type="date"
                            min={form.data.tanggal_mulai || undefined}
                            value={form.data.tanggal_selesai}
                            onChange={(event) => form.setData('tanggal_selesai', event.target.value)}
                            className={inputClass}
                            required
                        />
                        {form.errors.tanggal_selesai ? (
                            <p className={errorClass} role="alert">{form.errors.tanggal_selesai}</p>
                        ) : null}
                    </div>

                    <div>
                        <label htmlFor="sumber_dana" className={labelClass}>Sumber dana</label>
                        <input
                            id="sumber_dana"
                            value={form.data.sumber_dana}
                            onChange={(event) => form.setData('sumber_dana', event.target.value)}
                            className={inputClass}
                            placeholder="Contoh: APBD 2026"
                            required
                        />
                        {form.errors.sumber_dana ? (
                            <p className={errorClass} role="alert">{form.errors.sumber_dana}</p>
                        ) : null}
                    </div>

                    <div className="sm:col-span-2">
                        <label htmlFor="catatan" className={labelClass}>Catatan</label>
                        <textarea
                            id="catatan"
                            rows={2}
                            value={form.data.catatan}
                            onChange={(event) => form.setData('catatan', event.target.value)}
                            className={`${inputClass} min-h-20`}
                        />
                        {form.errors.catatan ? (
                            <p className={errorClass} role="alert">{form.errors.catatan}</p>
                        ) : null}
                    </div>
                </div>

                {hari > 0 ? (
                    <p className="mt-4 rounded-sm border border-line bg-paper px-4 py-2 text-sm text-muted">
                        Lama perjalanan <strong className="font-semibold text-ink">{hari} hari</strong>.
                    </p>
                ) : null}
            </section>

            <section className={`${cardClass} p-5 sm:p-6`}>
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h2 className="font-display text-2xl text-ink">Rincian biaya</h2>
                        <p className="mt-1 text-sm text-muted">
                            Subtotal dihitung otomatis dari jumlah dikali tarif.
                        </p>
                    </div>
                    <button type="button" onClick={addCost} className={btnSecondary}>
                        Tambah baris
                    </button>
                </div>

                <div className="mt-4 space-y-3">
                    {form.data.costs.map((cost, index) => {
                        const subtotal = Number(cost.jumlah || 0) * Number(cost.tarif || 0);

                        return (
                            <div key={index} className="rounded-sm border border-line bg-paper p-3">
                                <div className="grid gap-3 sm:grid-cols-[1.2fr_1.4fr_6rem_9rem]">
                                    <div>
                                        <label htmlFor={`jenis-${index}`} className={labelClass}>Jenis biaya</label>
                                        <input
                                            id={`jenis-${index}`}
                                            value={cost.jenis_biaya}
                                            onChange={(event) => updateCost(index, 'jenis_biaya', event.target.value)}
                                            className={inputClass}
                                            placeholder="Uang harian"
                                        />
                                        {form.errors[`costs.${index}.jenis_biaya`] ? (
                                            <p className={errorClass} role="alert">
                                                {form.errors[`costs.${index}.jenis_biaya`]}
                                            </p>
                                        ) : null}
                                    </div>

                                    <div>
                                        <label htmlFor={`keterangan-${index}`} className={labelClass}>Keterangan</label>
                                        <input
                                            id={`keterangan-${index}`}
                                            value={cost.keterangan}
                                            onChange={(event) => updateCost(index, 'keterangan', event.target.value)}
                                            className={inputClass}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor={`jumlah-${index}`} className={labelClass}>Jumlah</label>
                                        <input
                                            id={`jumlah-${index}`}
                                            inputMode="numeric"
                                            value={cost.jumlah}
                                            onChange={(event) =>
                                                updateCost(index, 'jumlah', event.target.value.replace(/\D/g, ''))
                                            }
                                            className={inputClass}
                                        />
                                        {form.errors[`costs.${index}.jumlah`] ? (
                                            <p className={errorClass} role="alert">
                                                {form.errors[`costs.${index}.jumlah`]}
                                            </p>
                                        ) : null}
                                    </div>

                                    <div>
                                        <label htmlFor={`tarif-${index}`} className={labelClass}>Tarif</label>
                                        <input
                                            id={`tarif-${index}`}
                                            inputMode="numeric"
                                            value={cost.tarif}
                                            onChange={(event) =>
                                                updateCost(index, 'tarif', event.target.value.replace(/\D/g, ''))
                                            }
                                            className={inputClass}
                                            placeholder="0"
                                        />
                                        {form.errors[`costs.${index}.tarif`] ? (
                                            <p className={errorClass} role="alert">
                                                {form.errors[`costs.${index}.tarif`]}
                                            </p>
                                        ) : null}
                                    </div>
                                </div>

                                <div className="mt-2 flex items-center justify-between gap-3">
                                    <p className="text-sm text-muted">
                                        Subtotal <span className="font-semibold text-ink">{formatRupiah(subtotal)}</span>
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => removeCost(index)}
                                        className="inline-flex min-h-11 items-center rounded-sm px-2 text-sm font-semibold text-danger underline underline-offset-2"
                                    >
                                        Hapus baris {index + 1}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <p className="mt-4 flex flex-wrap items-baseline justify-between gap-2 border-t border-line pt-4">
                    <span className="text-sm font-medium text-muted">Total biaya</span>
                    <span className="font-display text-3xl text-ink">{formatRupiah(total)}</span>
                </p>
            </section>

            <div className="flex flex-wrap items-center gap-2">
                <button type="submit" disabled={form.processing} className={btnSecondary}>
                    {form.processing ? 'Menyimpan...' : mode === 'create' ? 'Simpan sebagai draft' : 'Simpan perubahan'}
                </button>
                {canSubmit ? (
                    <button
                        type="button"
                        disabled={form.processing}
                        onClick={() => save('diajukan')}
                        className={btnPrimary}
                    >
                        Simpan dan ajukan
                    </button>
                ) : null}
                <Link href={mode === 'edit' && trip ? `/perjalanan/${trip.id}` : '/perjalanan'} className={btnSecondary}>
                    Batal
                </Link>
            </div>
            {form.processing ? null : (
                <p className="text-xs text-muted">
                    Perjalanan yang diajukan akan menunggu keputusan Pejabat Penyetuju.
                </p>
            )}
        </form>
    );
}
