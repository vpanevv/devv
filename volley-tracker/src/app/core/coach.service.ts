import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

export interface Coach {
    id: string;
    name: string;
}

const ACTIVE_COACH_KEY = 'VT_ACTIVE_COACH';
const COACHES_KEY = 'VT_COACHES';

function uid() {
    return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

@Injectable({ providedIn: 'root' })
export class CoachService {
    activeCoachId: string | null = null;
    activeCoachName: string | null = null;

    private initialized = false;

    async init() {
        if (this.initialized) return;

        const { value } = await Preferences.get({ key: ACTIVE_COACH_KEY });
        if (value) {
            const coach = JSON.parse(value) as Coach;
            this.activeCoachId = coach.id;
            this.activeCoachName = coach.name;
        }

        this.initialized = true;
    }

    async getAllCoaches(): Promise<Coach[]> {
        const { value } = await Preferences.get({ key: COACHES_KEY });
        return value ? JSON.parse(value) : [];
    }

    async setActiveCoach(coach: Coach) {
        this.activeCoachId = coach.id;
        this.activeCoachName = coach.name;

        await Preferences.set({
            key: ACTIVE_COACH_KEY,
            value: JSON.stringify(coach),
        });
    }

    async createCoach(name: string): Promise<Coach> {
        const trimmed = name.trim();
        if (!trimmed) throw new Error('Coach name is required');

        const coaches = await this.getAllCoaches();

        const coach: Coach = {
            id: uid(),
            name: trimmed,
        };

        coaches.push(coach);

        await Preferences.set({
            key: COACHES_KEY,
            value: JSON.stringify(coaches),
        });

        await this.setActiveCoach(coach);

        return coach;
    }

    /**
  * Finds coach by name (case-insensitive). If not found, creates it.
  * Returns the coach object.
  */
    async upsertCoachByName(name: string): Promise<Coach> {
        await this.init();

        const trimmed = (name ?? '').trim();
        if (!trimmed) throw new Error('Coach name is required.');

        const coaches = await this.getAllCoaches();

        const existing = coaches.find(
            c => c.name.trim().toLowerCase() === trimmed.toLowerCase()
        );

        if (existing) return existing;

        const coach: Coach = {
            id: uid(),
            name: trimmed,
            createdAt: new Date().toISOString(),
        };

        coaches.unshift(coach);
        await Preferences.set({ key: COACHES_KEY, value: JSON.stringify(coaches) });

        return coach;
    }

    async clearActiveCoach() {
        this.activeCoachId = null;
        this.activeCoachName = null;
        await Preferences.remove({ key: ACTIVE_COACH_KEY });
    }
}