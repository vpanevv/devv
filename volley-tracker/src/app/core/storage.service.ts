import { Injectable } from "@angular/core";
import { Preferences } from "@capacitor/preferences";
import { AppStateV1 } from "./models";

const STORAGE_KEY = 'volleytracker:v1';

const DEFAULT_STATE: AppStateV1 = {
    coachName: null,
    groups: [],
    players: [],
    attendance: {}
};

@Injectable({ providedIn: 'root' })

export class StorageService {
    async load(): Promise<AppStateV1> {
        const { value } = await Preferences.get({ key: STORAGE_KEY });

        if (!value) return { ...DEFAULT_STATE };

        try {
            const parsed = JSON.parse(value) as AppStateV1;

            return {
                ...DEFAULT_STATE,
                ...parsed,
                groups: parsed.groups ?? [],
                players: parsed.players ?? [],
                attendance: parsed.attendance ?? {},
            };
        } catch {
            return { ...DEFAULT_STATE };
        }
    }

    async save(state: AppStateV1): Promise<void> {
        await Preferences.set({
            key: STORAGE_KEY,
            value: JSON.stringify(state)
        });
    }

    async clear(): Promise<void> {
        await Preferences.remove({ key: STORAGE_KEY });
    }
}
