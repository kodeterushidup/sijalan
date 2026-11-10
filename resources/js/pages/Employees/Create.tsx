import { Head } from '@inertiajs/react';
import AppLayout from '@/components/AppLayout';
import EmployeeForm from '@/components/EmployeeForm';
import Flash from '@/components/Flash';
import PageHeader from '@/components/PageHeader';

type UnitOption = { value: number; label: string };

export default function EmployeesCreate({ units }: { units: UnitOption[] }) {
    return (
        <AppLayout>
            <Head title="Tambah pegawai" />
            <Flash />
            <PageHeader
                title="Tambah pegawai"
                description="Pegawai yang dibuat di sini otomatis mendapat akun dengan peran Pegawai."
            />
            <EmployeeForm units={units} mode="create" />
        </AppLayout>
    );
}
