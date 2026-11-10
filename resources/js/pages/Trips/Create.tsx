import { Head } from '@inertiajs/react';
import AppLayout from '@/components/AppLayout';
import Flash from '@/components/Flash';
import PageHeader from '@/components/PageHeader';
import TripForm from '@/components/TripForm';

type EmployeeOption = { value: number; label: string };

export default function TripsCreate({
    employees,
    defaults,
    alatAngkut,
}: {
    employees: EmployeeOption[];
    defaults: { tanggal_mulai: string; unit: string };
    alatAngkut: string[];
}) {
    return (
        <AppLayout>
            <Head title="Perjalanan baru" />
            <Flash />
            <PageHeader
                title="Perjalanan baru"
                description="Simpan sebagai draft untuk diperiksa dulu, atau langsung ajukan ke Pejabat Penyetuju."
            />
            <TripForm mode="create" employees={employees} alatAngkut={alatAngkut} defaults={defaults} />
        </AppLayout>
    );
}
