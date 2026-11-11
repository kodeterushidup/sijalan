import type { ReactNode } from 'react';

export default function PageHeader({
    title,
    description,
    actions,
}: {
    title: string;
    description?: string;
    actions?: ReactNode;
}) {
    return (
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0">
                <h1 className="font-display text-3xl leading-tight text-balance text-ink sm:text-4xl">{title}</h1>
                {description ? <p className="mt-1 max-w-2xl text-pretty text-sm text-muted">{description}</p> : null}
            </div>
            {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
        </div>
    );
}
