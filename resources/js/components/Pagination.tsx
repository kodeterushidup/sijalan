import { Link } from '@inertiajs/react';
import { btnSecondary } from '@/lib/styles';
import type { Paginated } from '@/types';

export default function Pagination<T>({
    page,
    label,
}: {
    page: Paginated<T>;
    label: string;
}) {
    return (
        <nav aria-label={label} className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
            <p className="text-muted">
                Menampilkan {page.data.length} dari {page.total} data. Halaman {page.current_page} dari {page.last_page}.
            </p>
            <div className="flex gap-2">
                {page.prev_page_url ? (
                    <Link href={page.prev_page_url} className={btnSecondary}>
                        Sebelumnya
                    </Link>
                ) : null}
                {page.next_page_url ? (
                    <Link href={page.next_page_url} className={btnSecondary}>
                        Berikutnya
                    </Link>
                ) : null}
            </div>
        </nav>
    );
}
