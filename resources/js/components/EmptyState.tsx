import type { ReactNode } from 'react';

export default function EmptyState({
    title,
    description,
    action,
}: {
    title: string;
    description: string;
    action?: ReactNode;
}) {
    return (
        <div className="rounded-md border border-dashed border-line bg-surface px-5 py-8 text-center">
            <p className="font-display text-xl text-ink">{title}</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted">{description}</p>
            {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
        </div>
    );
}
