import { Head, Link, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Flash from '@/components/Flash';
import PageHeader from '@/components/PageHeader';
import StatusBadge, { statusStyles } from '@/components/StatusBadge';
import { formatDateShort } from '@/lib/format';
import { btnPrimary, btnSecondary, cardClass, inputClass, labelClass } from '@/lib/styles';
import type { TripStatus } from '@/types';

type Day = {
    date: string;
    day: number;
    in_month: boolean;
    is_today: boolean;
};

type TripEntry = {
    id: number;
    maksud: string;
    tempat_tujuan: string;
    pegawai: string;
    unit: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
    status: TripStatus;
    status_label: string;
    nomor_sppd: string | null;
};

type Option = { value: number; label: string };

const weekdays = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

function Chevron({ direction, className = '' }: { direction: 'left' | 'right'; className?: string }) {
    return (
        <svg
            viewBox="0 0 20 20"
            aria-hidden="true"
            className={`size-4 shrink-0 ${className}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            {direction === 'left' ? <path d="M12 5l-5 5 5 5" /> : <path d="M8 5l5 5-5 5" />}
        </svg>
    );
}

function DayNumber({ day, isToday, dimmed = false }: { day: number; isToday: boolean; dimmed?: boolean }) {
    return (
        <span
            className={`grid size-8 place-items-center rounded-sm font-display text-sm font-semibold ${
                isToday ? 'bg-accent text-white' : dimmed ? 'text-muted' : 'text-ink'
            }`}
        >
            {day}
        </span>
    );
}

const legend: { status: TripStatus; label: string }[] = [
    { status: 'draft', label: 'Draft' },
    { status: 'diajukan', label: 'Menunggu Persetujuan' },
    { status: 'disetujui', label: 'Disetujui' },
    { status: 'berlangsung', label: 'Berlangsung' },
    { status: 'selesai', label: 'Selesai' },
    { status: 'ditolak', label: 'Ditolak' },
    { status: 'dibatalkan', label: 'Dibatalkan' },
];

export default function CalendarIndex({
    bulan,
    bulanLabel,
    today,
    prev,
    next,
    days,
    trips,
    units,
    employees,
    filters,
    canCreate,
}: {
    bulan: string;
    bulanLabel: string;
    today: string;
    prev: string;
    next: string;
    days: Day[];
    trips: TripEntry[];
    units: Option[];
    employees: Option[];
    filters: { unit: number | null; pegawai: number | null };
    canCreate: boolean;
}) {
    const [form, setForm] = useState({
        unit: filters.unit ? String(filters.unit) : '',
        pegawai: filters.pegawai ? String(filters.pegawai) : '',
    });

    function href(targetMonth: string, unit = form.unit, pegawai = form.pegawai): string {
        const params = new URLSearchParams({ bulan: targetMonth });

        if (unit) {
            params.set('unit', unit);
        }

        if (pegawai) {
            params.set('pegawai', pegawai);
        }

        return `/kalender?${params.toString()}`;
    }

    function applyFilters(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        router.get('/kalender', {
            bulan,
            unit: form.unit || undefined,
            pegawai: form.pegawai || undefined,
        }, { preserveState: true, replace: true });
    }

    function resetFilters() {
        setForm({ unit: '', pegawai: '' });
        router.get('/kalender', { bulan }, { preserveState: true, replace: true });
    }

    const monthKey = bulan.slice(0, 7);
    const [year, month] = monthKey.split('-').map(Number);
    const monthStart = `${monthKey}-01`;
    const monthEnd = new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10);
    const monthTrips = trips.filter((trip) => trip.tanggal_mulai <= monthEnd && trip.tanggal_selesai >= monthStart);

    const entriesByDay = useMemo(() => {
        const byDate = new Map<string, TripEntry[]>();

        for (const day of days) {
            if (!day.in_month) {
                continue;
            }

            byDate.set(
                day.date,
                trips.filter((trip) => trip.tanggal_mulai <= day.date && trip.tanggal_selesai >= day.date),
            );
        }

        return byDate;
    }, [days, trips]);

    return (
        <AppLayout>
            <Head title="Kalender perjalanan" />
            <Flash />
            <PageHeader
                title="Kalender perjalanan"
                description={
                    canCreate
                        ? 'Jadwal perjalanan dinas per pegawai dan unit. Klik tanggal untuk mencatat perjalanan baru.'
                        : 'Jadwal perjalanan dinas Anda. Klik entri untuk melihat detail.'
                }
                actions={
                    canCreate ? (
                        <Link href="/perjalanan/baru" className={btnPrimary}>
                            Perjalanan baru
                        </Link>
                    ) : undefined
                }
            />

            <div className={`${cardClass} mb-4 flex flex-wrap items-center justify-between gap-3 p-4`}>
                <div className="flex flex-wrap items-center gap-2">
                    <Link href={href(prev)} className={`${btnSecondary} max-sm:px-3`} aria-label="Bulan sebelumnya">
                        <Chevron direction="left" className="max-sm:hidden" />
                        Sebelumnya
                    </Link>
                    <p className="order-first w-full text-center font-display text-2xl text-ink capitalize sm:order-none sm:w-auto sm:min-w-40" aria-live="polite">
                        {bulanLabel}
                    </p>
                    <Link href={href(next)} className={`${btnSecondary} max-sm:px-3`} aria-label="Bulan berikutnya">
                        Berikutnya
                        <Chevron direction="right" className="max-sm:hidden" />
                    </Link>
                    <Link href={href(today)} className={`${btnSecondary} max-sm:px-3`}>
                        Hari ini
                    </Link>
                </div>

                {units.length > 0 ? (
                    <form onSubmit={applyFilters} className="flex flex-wrap items-end gap-2">
                        <div>
                            <label htmlFor="unit" className={labelClass}>Unit kerja</label>
                            <select
                                id="unit"
                                value={form.unit}
                                onChange={(event) => setForm({ ...form, unit: event.target.value })}
                                className={`${inputClass} min-w-40`}
                            >
                                <option value="">Semua unit</option>
                                {units.map((unit) => (
                                    <option key={unit.value} value={unit.value}>{unit.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="pegawai" className={labelClass}>Pegawai</label>
                            <select
                                id="pegawai"
                                value={form.pegawai}
                                onChange={(event) => setForm({ ...form, pegawai: event.target.value })}
                                className={`${inputClass} min-w-48`}
                            >
                                <option value="">Semua pegawai</option>
                                {employees.map((employee) => (
                                    <option key={employee.value} value={employee.value}>{employee.label}</option>
                                ))}
                            </select>
                        </div>
                        <button type="submit" className={btnPrimary}>Terapkan</button>
                        <button type="button" onClick={resetFilters} className={btnSecondary}>Atur ulang</button>
                    </form>
                ) : null}
            </div>

            <div className={`${cardClass} overflow-hidden`}>
                <div
                    tabIndex={0}
                    role="region"
                    aria-labelledby="kalender-caption"
                    className="relative overflow-x-auto"
                >
                    <table className="w-full min-w-[720px] table-fixed border-collapse">
                        <caption id="kalender-caption" className="sr-only">
                            Kalender perjalanan dinas {bulanLabel}
                        </caption>
                        <thead>
                            <tr>
                                {weekdays.map((weekday) => (
                                    <th
                                        key={weekday}
                                        scope="col"
                                        className="border-b border-line bg-paper px-2 py-2 text-left text-xs font-semibold tracking-wide text-muted uppercase"
                                    >
                                        {weekday}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: 6 }, (_, row) => (
                                <tr key={row}>
                                    {days.slice(row * 7, row * 7 + 7).map((day, column) => {
                                        const entries = entriesByDay.get(day.date) ?? [];
                                        const isWeekend = column >= 5;

                                        return (
                                            <td
                                                key={day.date}
                                                className={`h-24 min-w-0 border-r border-b border-line p-1.5 align-top ${
                                                    day.in_month
                                                        ? isWeekend
                                                            ? 'bg-paper/60'
                                                            : 'bg-surface'
                                                        : 'bg-paper/40'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    {canCreate && day.in_month ? (
                                                        <Link
                                                            href={`/perjalanan/baru?tanggal=${day.date}`}
                                                            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-sm transition-colors hover:bg-paper"
                                                            aria-label={`Buat perjalanan pada ${formatDateShort(day.date)}`}
                                                        >
                                                            <DayNumber day={day.day} isToday={day.is_today} dimmed={!day.in_month} />
                                                        </Link>
                                                    ) : (
                                                        <span className="inline-flex min-h-11 min-w-11 items-center justify-center">
                                                            <DayNumber day={day.day} isToday={day.is_today} dimmed={!day.in_month} />
                                                        </span>
                                                    )}
                                                </div>

                                                <ul className="space-y-1">
                                                    {entries.map((trip) => (
                                                        <li key={trip.id}>
                                                            <Link
                                                                href={`/perjalanan/${trip.id}`}
                                                                title={`${trip.maksud} · ${trip.pegawai}`}
                                                                className={`block truncate rounded-sm border px-1.5 py-0.5 text-[11px] font-semibold ${statusStyles[trip.status]}`}
                                                            >
                                                                {trip.maksud}
                                                                <span className="sr-only">
                                                                    {' '}oleh {trip.pegawai}, status {trip.status_label}
                                                                </span>
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Legenda</p>
                {legend.map((item) => (
                    <span key={item.status} className="inline-flex items-center gap-1.5 text-xs text-muted">
                        <span className={`inline-block size-3 rounded-sm border ${statusStyles[item.status]}`} aria-hidden="true" />
                        {item.label}
                    </span>
                ))}
            </div>

            <section className="mt-6 lg:hidden">
                <h2 className="font-display text-2xl text-ink">Perjalanan bulan ini</h2>

                {monthTrips.length === 0 ? (
                    <p className="mt-2 rounded-sm border border-dashed border-line bg-surface px-4 py-6 text-center text-sm text-muted">
                        Belum ada perjalanan pada {bulanLabel}.
                    </p>
                ) : (
                    <ul className="mt-3 space-y-2">
                        {monthTrips.map((trip) => (
                            <li key={trip.id} className={`${cardClass} p-3`}>
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <StatusBadge status={trip.status} label={trip.status_label} />
                                    <p className="text-xs text-muted">
                                        {formatDateShort(trip.tanggal_mulai)} sampai {formatDateShort(trip.tanggal_selesai)}
                                    </p>
                                </div>
                                <Link
                                    href={`/perjalanan/${trip.id}`}
                                    className="mt-1 block font-semibold text-ink underline-offset-2 hover:underline"
                                >
                                    {trip.maksud}
                                </Link>
                                <p className="text-sm text-muted">{trip.tempat_tujuan} · {trip.pegawai}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </AppLayout>
    );
}
