import '../css/app.css';

import { createInertiaApp, type ResolvedComponent } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';

const pages = import.meta.glob<{ default: ResolvedComponent }>('./pages/**/*.tsx');

createInertiaApp({
    title: (title) => (title ? `${title} | SIJALAN` : 'SIJALAN'),
    resolve: async (name) => (await pages[`./pages/${name}.tsx`]()).default,
    setup: ({ el, App, props }: { el: HTMLElement | null; App: any; props: any }) => {
        if (!el) {
            return;
        }

        createRoot(el).render(<App {...props} />);
    },
    progress: {
        color: '#8a5a00',
    },
});
