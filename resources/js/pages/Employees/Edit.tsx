import { Head } from '@inertiajs/react';
import AppLayout from '@/components/AppLayout';
import EmployeeForm from '@/components/EmployeeForm';
import Flash from '@/components/Flash';
import PageHeader from '@/components/PageHeader';

type UnitOption = { value: number; label: string };

type Employee = {
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

export default function EmployeesEdit({
    employee,
    units,
}: {
    employee: Employee;
    units: UnitOption[];
}) {
    return (
        <AppLayout>
            <Head title={`Ubah data ${employee.name}`} />
            <Flash />
            <PageHeader
                title="Ubah data pegawai"
                description="Perubahan unit kerja berlaku untuk perjalanan yang dibuat setelahnya."
            />
            <EmployeeForm employee={employee} units={units} mode="edit" />
        </AppLayout>
    );
}
