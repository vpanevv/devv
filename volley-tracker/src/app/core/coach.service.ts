import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { BehaviorSubject } from 'rxjs';

export type Coach = {
    id: string;
    name: string;
    createdAt: string; // ISO
};

const COACHES_KEY = 'VT_COACHES';
const ACTIVE_COACH_KEY = 'VT_ACTIVE_COACH_ID';

function uid() {
    return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

@Injectable({ providedIn: 'root' })
export class CoachService {
    private activeCoachIdSubject = new BehaviorSubject<string | null>(null);
    activeCoachId$ = this.activeCoachIdSubject.asObservable();

    private initialized = false;

    get activeCoachId(): string | null {
        return this.activeCoachIdSubject.value;
    }

    async init(): Promise<void> {
        if (this.initialized) return;
        const { value } = await Preferences.get({ key: ACTIVE_COACH_KEY });
        this.activeCoachIdSubject.next(value ?? null);
        this.initialized = true;
    }

    async listCoaches(): Promise<Coach[]> {
        const { value } = await Preferences.get({ key: COACHES_KEY });
        return value ? (JSON.parse(value) as Coach[]) : [];
    }

    async upsertCoachByName(name: string): Promise<Coach> {
        const trimmed = (name ?? '').trim();
        if (!trimmed) throw new Error('Coach name is required.');

        const coaches = await this.listCoaches();
        const existing = coaches.find(c => c.name.toLowerCase() === trimmed.toLowerCase());
        if (existing) return existing;

        const coach: Coach = {
            id: uid(),
            name: trimmed,
            createdAt: new Date().toISOString(),
        };

        coaches.push(coach);
        await Preferences.set({ key: COACHES_KEY, value: JSON.stringify(coaches) });
        return coach;
    }

    async setActiveCoach(id: string): Promise<void> {
        await Preferences.set({ key: ACTIVE_COACH_KEY, value: id });
        this.activeCoachIdSubject.next(id); // 🔥 instant update
    }

    async clearActiveCoach(): Promise<void> {
        await Preferences.remove({ key: ACTIVE_COACH_KEY });
        this.activeCoachIdSubject.next(null);
    }

    async getActiveCoach(): Promise<Coach | null> {
        await this.init();
        const id = this.activeCoachId;
        if (!id) return null;
        const coaches = await this.listCoaches();
        return coaches.find(c => c.id === id) ?? null;
    }
}