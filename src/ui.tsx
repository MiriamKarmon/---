import React, { useState } from 'react';

// Small local UI kit used by the game shell (App.tsx).
// Plain React components + localStorage persistence, no external services.

export function FileCard({ children }: { children: React.ReactNode }) {
    return <div className="file-card">{children}</div>;
}

export function Header({ title, fact, intro }: { title: string; fact?: string; intro?: string }) {
    return <header className="file-header">
        <h1>{title}</h1>
        {fact && <p className="file-fact">{fact}</p>}
        {intro && <p className="file-intro">{intro}</p>}
    </header>;
}

export function Group({ label, heading, children }: { label: string; heading?: boolean; children: React.ReactNode }) {
    return <section className="file-group">
        {heading ? <h2>{label}</h2> : <h3>{label}</h3>}
        {children}
    </section>;
}

export function Paragraph({ children }: { children: React.ReactNode }) {
    return <p>{children}</p>;
}

export function Caption({ children }: { children: React.ReactNode }) {
    return <p className="file-caption">{children}</p>;
}

export function Callout({ title, tone, children }: { title: string; tone?: 'success' | 'warning' | 'info'; children: React.ReactNode }) {
    return <div className={`file-callout tone-${tone ?? 'info'}`}>
        <strong>{title}</strong>
        <p>{children}</p>
    </div>;
}

export function Photos({ label, items }: { label: string; items: { src: string; alt: string }[] }) {
    return <figure className="file-photos" aria-label={label}>
        {items.map(i => <img key={i.src} src={i.src} alt={i.alt} />)}
    </figure>;
}

export function Closing({ children }: { children: React.ReactNode }) {
    return <footer className="file-closing">{children}</footer>;
}

// useLocalState: like useState, but persists the value in the browser's
// localStorage under the given key, so progress survives a page refresh.
// Returns [value, setValue, { ready, message }] - ready/message kept for
// API compatibility; always ready here.
export function useLocalState<T>(key: string, initial: T): [T, (v: T) => void, { ready: boolean; message: string }] {
    const [value, setValue] = useState<T>(() => {
        try {
            const raw = localStorage.getItem(key);
            return raw !== null ? JSON.parse(raw) as T : initial;
        } catch {
            return initial;
        }
    });
    const set = (v: T) => {
        setValue(v);
        try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* storage full/blocked */ }
    };
    return [value, set, { ready: true, message: '' }];
}
