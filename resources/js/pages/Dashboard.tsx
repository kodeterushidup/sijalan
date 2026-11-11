import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/components/AppLayout';
import EmptyState from '@/components/EmptyState';
import Flash from '@/components/Flash';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import { formatDateShort } from '@/lib/format';
import { cardClass } from '@/lib/styles';
import type { SharedPageProps, TripStatus } from '@/types';

type Stats = {
    bulan_ini: number;
    menunggu: number;
    berlangsung: number;
    belum_lengkap: number;
};

type UpcomingTrip = {
    id: number;
    pegawai: string;
    unit: string;
    tujuan: string;
    maksud: string;
    mulai: string;
    selesai: string;
    status: TripStatus;
    status_label: string;
};

type UnitTotal = {
    nama: string;
    total: number;
};

const todayLabel = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
});

export default function Dashboard({
    stats,
    upcoming,
    unitChart,
}: {
    stats: Stats;
    upcoming: UpcomingTrip[];
    unitChart: UnitTotal[];
}) {
    const { auth } = usePage<SharedPageProps>().props;
    const user = auth.user;
    const isPegawai = user?.role === 'pegawai';

    const focal = isPegawai
        ? {
              label: 'Perjalanan sedang berlangsung',
              value: stats.berlangsung,
              note: 'Perjalanan yang sudah dimulai dan belum ditutup.',
          }
        : {
              label: 'Menunggu persetujuan',
              value: stats.menunggu,
              note: 'Perjalanan yang menunggu keputusan Pejabat Penyetuju.',
          };

    const secondary = [
        { label: 'Perjalanan bulan ini', value: stats.bulan_ini },
        { label: 'Sedang berlangsung', value: stats.berlangsung },
        { label: 'Berkas belum lengkap', value: stats.belum_lengkap },
    ];

    const focalHref = isPegawai
        ? '/perjalanan'
        : user?.role === 'pejabat'
          ? '/persetujuan'
          : '/perjalanan?status=diajukan';

    const today = todayLabel.format(new Date());

    const maxUnitTotal = Math.max(1, ...unitChart.map((unit) => unit.total));

    return (
        <AppLayout>
            <Head title="Ringkasan" />
            <Flash />
            <PageHeader title="Ringkasan" description={today} />

            <div className="grid gap-4 md:grid-cols-[1.1fr_1fr]">
                <Link href={focalHref} className="stat-focal">
                    <div className="stat-focal-top">
                        <p className="stat-focal-figure">{focal.value}</p>
                        <svg
                            viewBox="0 0 20 20"
                            aria-hidden="true"
                            className="stat-focal-arrow"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M4 10h11M11 6l4 4-4 4" />
                        </svg>
                    </div>
                    <p className="stat-focal-label">{focal.label}</p>
                    <p className="stat-focal-note">{focal.note}</p>
                </Link>

                <dl className={`${cardClass} divide-y divide-line`}>
                    {secondary.map((item) => (
                        <div key={item.label} className="flex items-baseline justify-between gap-4 px-5 py-4">
                            <dt className="text-sm text-muted">{item.label}</dt>
                            <dd className="font-display text-3xl text-ink tabular-nums">{item.value}</dd>
                        </div>
                    ))}
                </dl>
            </div>

            {unitChart.length > 0 ? (
                <section className="mt-8">
                    <h2 className="mb-3 font-display text-2xl text-ink">Perjalanan per unit, 6 bulan terakhir</h2>
                    <ul className={`${cardClass} space-y-4 p-5`}>
                        {unitChart.map((unit) => (
                            <li key={unit.nama}>
                                <div className="flex items-baseline justify-between gap-4 text-sm">
                                    <span className="text-ink">{unit.nama}</span>
                                    <span className="font-semibold text-ink tabular-nums">{unit.total}</span>
                                </div>
                                <div
                                    className="mt-1.5 h-2 overflow-hidden rounded-sm bg-paper"
                                    role="progressbar"
                                    aria-label={`${unit.nama}: ${unit.total} perjalanan`}
                                    aria-valuenow={unit.total}
                                    aria-valuemin={0}
                                    aria-valuemax={maxUnitTotal}
                                >
                                    <div
                                        className="h-full rounded-sm bg-accent"
                                        style={{ width: `${Math.round((unit.total / maxUnitTotal) * 100)}%` }}
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>
            ) : null}

            <section className="mt-8">
                <h2 className="mb-3 font-display text-2xl text-ink">Perjalanan terdekat</h2>

                {upcoming.length === 0 ? (
                    <EmptyState
                        title="Belum ada perjalanan terdekat"
                        description={
                            isPegawai
                                ? 'Perjalanan yang sudah disetujui dan belum selesai akan muncul di sini.'
                                : 'Perjalanan yang sudah disetujui akan muncul di sini setelah tanggalnya mendekat.'
                        }
                    />
                ) : (
                    <ul className={`${cardClass} divide-y divide-line`}>
                        {upcoming.map((trip) => (
                            <li key={trip.id} className="flex flex-wrap items-start justify-between gap-3 px-5 py-4">
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-ink">{trip.maksud}</p>
                                    <p className="mt-0.5 text-sm text-muted">
                                        {trip.tujuan} · {trip.pegawai} · {trip.unit}
                                    </p>
                                    <p className="mt-1 text-xs text-muted">
                                        {formatDateShort(trip.mulai)} sampai {formatDateShort(trip.selesai)}
                                    </p>
                                </div>
                                <StatusBadge status={trip.status} label={trip.status_label} />
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </AppLayout>
    );
}
