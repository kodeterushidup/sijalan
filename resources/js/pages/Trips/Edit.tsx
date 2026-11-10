import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/components/AppLayout';
import Flash from '@/components/Flash';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import TripForm from '@/components/TripForm';
import { btnPrimary, btnSecondary, cardClass, errorClass, inputClass, labelClass } from '@/lib/styles';
import type { TripStatus } from '@/types';

type Trip = {
    id: number;
    user_id: number;
    maksud: string;
    tempat_tujuan: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
    alat_angkut: string;
    sumber_dana: string;
    catatan: string | null;
    status: TripStatus;
    status_label: string;
    costs: { jenis_biaya: string; keterangan: string | null; jumlah: number; tarif: number }[];
};

type EmployeeOption = { value: number; label: string };

export default function TripsEdit({
    trip,
    employees,
    alatAngkut,
    locked,
}: {
    trip: Trip;
    employees: EmployeeOption[];
    alatAngkut: string[];
    locked: boolean;
}) {
    return (
        <AppLayout>
            <Head title={`Ubah perjalanan ${trip.maksud}`} />
            <Flash />
            <PageHeader
                title="Ubah perjalanan"
                description={trip.maksud}
                actions={<StatusBadge status={trip.status} label={trip.status_label} />}
            />

            {locked ? <LockedEdit trip={trip} /> : <TripForm mode="edit" trip={trip} employees={employees} alatAngkut={alatAngkut} />}
        </AppLayout>
    );
}

function LockedEdit({ trip }: { trip: Trip }) {
    const form = useForm({ catatan: trip.catatan ?? '' });

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.patch(`/perjalanan/${trip.id}`, { preserveScroll: true });
    }

    return (
        <div className="space-y-4">
            <p className="rounded-sm border border-info/30 bg-info-soft px-4 py-3 text-sm text-info" role="status">
                Perjalanan berstatus {trip.status_label} sudah disetujui. Hanya catatan yang dapat diubah.
            </p>

            <section className={`${cardClass} max-w-2xl p-5 sm:p-6`}>
                <h2 className="font-display text-2xl text-ink">Catatan</h2>

                <form onSubmit={submit} className="mt-4 space-y-4">
                    <div>
                        <label htmlFor="catatan" className={labelClass}>Catatan perjalanan</label>
                        <textarea
                            id="catatan"
                            rows={5}
                            value={form.data.catatan}
                            onChange={(event) => form.setData('catatan', event.target.value)}
                            className={`${inputClass} min-h-32`}
                        />
                        {form.errors.catatan ? (
                            <p className={errorClass} role="alert">{form.errors.catatan}</p>
                        ) : null}
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button type="submit" disabled={form.processing} className={btnPrimary}>
                            {form.processing ? 'Menyimpan...' : 'Simpan catatan'}
                        </button>
                        <Link href={`/perjalanan/${trip.id}`} className={btnSecondary}>Kembali ke detail</Link>
                    </div>
                </form>
            </section>
        </div>
    );
}
