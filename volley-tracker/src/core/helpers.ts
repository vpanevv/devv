// src/app/core/helpers.ts

/**
 * Generates a cryptographically strong unique ID.
 * Works on iOS, Android, and Web (via Capacitor).
 *
 * Example:
 *  "c_9f4a2b8e7d3a4c8e9b2f1a6d5e4c3b2a"
 */
export function uid(prefix = ''): string {
    // cruptographic random number generator
    // works on iOS, Android, Web
    // used in banks, cryptocurrency, etc.
    // creates 16 байта = 128 бита = 3.4 × 10^38 възможни комбинации
    const bytes = crypto.getRandomValues(new Uint8Array(16));

    // convert to hex
    const hex = Array.from(bytes) // превръща Uint8Array в обикновен JS масив [12, 255, 3, 98, ...]
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    // b е число от 0 до 255 -> превръща го в hex (0-ff) -> 0->"00", 10->"0a", 255->"ff"

    return prefix ? `${prefix}_${hex}` : hex;
}


/**
 * ISO timestamp: 2026-01-22T12:34:56.123Z
 */
export function nowISO(): string {
    return new Date().toISOString();
}


/**
 * Date only: YYYY-MM-DD
 * Used for trainings & calendar
 */
export function todayISODate(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}