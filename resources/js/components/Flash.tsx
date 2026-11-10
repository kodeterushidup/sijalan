import { usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { SharedPageProps } from '@/types';

export default function Flash() {
    const { flash } = usePage<SharedPageProps>().props;
    const [dismissed, setDismissed] = useState<string[]>([]);

    const messages = [
        flash.success ? { tone: 'success' as const, text: flash.success } : null,
        flash.error ? { tone: 'error' as const, text: flash.error } : null,
    ].filter((message): message is { tone: 'success' | 'error'; text: string } => {
        return message !== null && !dismissed.includes(message.text);
    });

    if (messages.length === 0) {
        return null;
    }

    return (
        <div className="mb-6 space-y-2">
            {messages.map((message) => (
                <div
                    key={message.text}
                    role={message.tone === 'error' ? 'alert' : 'status'}
                    className={`flex items-start justify-between gap-4 rounded-sm border px-4 py-3 text-sm ${
                        message.tone === 'error'
                            ? 'border-danger/30 bg-danger-soft text-danger'
                            : 'border-success/30 bg-success-soft text-success'
                    }`}
                >
                    <p>{message.text}</p>
                    <button
                        type="button"
                        onClick={() => setDismissed((current) => [...current, message.text])}
                        className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-sm underline underline-offset-2"
                    >
                        Tutup
                    </button>
                </div>
            ))}
        </div>
    );
}
