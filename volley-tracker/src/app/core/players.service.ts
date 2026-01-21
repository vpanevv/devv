import { Injectable } from '@angular/core';
import { Player } from './models';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class PlayersService {
    constructor(private storage: StorageService) { }

    async getByGroup(groupId: string): Promise<Player[]> {
        const state = await this.storage.load();
        return state.players.filter(p => p.groupId === groupId);
    }

    async create(groupId: string, name: string): Promise<Player> {
        const trimmed = (name || '').trim();
        if (!trimmed) throw new Error('Player name is required.');

        const state = await this.storage.load();

        const player: Player = {
            id: crypto.randomUUID(),
            groupId,
            name: trimmed,
            createdAt: new Date().toISOString(),
        };

        state.players = [player, ...state.players];
        await this.storage.save(state);
        return player;
    }

    async rename(playerId: string, newName: string): Promise<void> {
        const trimmed = (newName || '').trim();
        if (!trimmed) throw new Error('Player name is required.');

        const state = await this.storage.load();
        const idx = state.players.findIndex(p => p.id === playerId);
        if (idx < 0) throw new Error('Player not found.');

        state.players[idx] = { ...state.players[idx], name: trimmed };
        await this.storage.save(state);
    }

    async delete(playerId: string): Promise<void> {
        const state = await this.storage.load();
        state.players = state.players.filter(p => p.id !== playerId);

        // (по желание) чистим attendance записи за това дете навсякъде
        // attendance[groupId][date][playerId]
        for (const groupId of Object.keys(state.attendance || {})) {
            const byDate = state.attendance[groupId] || {};
            for (const dateKey of Object.keys(byDate)) {
                const byPlayer = byDate[dateKey] || {};
                if (byPlayer[playerId]) {
                    const { [playerId]: _, ...rest } = byPlayer;
                    byDate[dateKey] = rest;
                }
            }
            state.attendance[groupId] = byDate;
        }

        await this.storage.save(state);
    }

    async countByGroup(groupId: string): Promise<number> {
        const players = await this.getByGroup(groupId);
        return players.length;
    }
}