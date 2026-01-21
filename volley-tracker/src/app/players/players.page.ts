import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { GroupsService } from '../core/groups.service';
import { PlayersService } from '../core/players.service';
import { Group, Player } from '../core/models';

@Component({
    selector: 'app-players',
    standalone: true,
    imports: [CommonModule, IonicModule, RouterModule],
    templateUrl: './players.page.html',
})
export class PlayersPage {
    groupId = '';
    group: Group | null = null;

    players: Player[] = [];
    isLoading = true;
    error: string | null = null;

    constructor(
        private route: ActivatedRoute,
        private groupsService: GroupsService,
        private playersService: PlayersService,
        private alertCtrl: AlertController
    ) { }

    async ionViewWillEnter() {
        this.groupId = this.route.snapshot.paramMap.get('groupId') ?? '';
        await this.load();
    }

    private async load() {
        this.isLoading = true;
        this.error = null;

        try {
            this.group = await this.groupsService.getById(this.groupId);
            if (!this.group) {
                this.error = 'Group not found.';
                this.players = [];
                return;
            }

            this.players = await this.playersService.getByGroup(this.groupId);
        } catch (e) {
            console.error(e);
            this.error = 'Failed to load players.';
        } finally {
            this.isLoading = false;
        }
    }

    async addPlayer() {
        const alert = await this.alertCtrl.create({
            header: 'New player',
            message: 'Enter player name.',
            inputs: [{ name: 'name', type: 'text', placeholder: 'e.g. Ivan Petrov' }],
            buttons: [
                { text: 'Cancel', role: 'cancel' },
                {
                    text: 'Add',
                    handler: async (data) => {
                        try {
                            await this.playersService.create(this.groupId, data?.name ?? '');
                            await this.load();
                        } catch (e: any) {
                            await this.showError(e?.message ?? 'Could not add player.');
                        }
                    },
                },
            ],
        });

        await alert.present();
    }

    async renamePlayer(p: Player) {
        const alert = await this.alertCtrl.create({
            header: 'Rename player',
            inputs: [{ name: 'name', type: 'text', value: p.name }],
            buttons: [
                { text: 'Cancel', role: 'cancel' },
                {
                    text: 'Save',
                    handler: async (data) => {
                        try {
                            await this.playersService.rename(p.id, data?.name ?? '');
                            await this.load();
                        } catch (e: any) {
                            await this.showError(e?.message ?? 'Could not rename player.');
                        }
                    },
                },
            ],
        });

        await alert.present();
    }

    async deletePlayer(p: Player) {
        const alert = await this.alertCtrl.create({
            header: 'Delete player?',
            message: `Delete <b>${p.name}</b>? This cannot be undone.`,
            buttons: [
                { text: 'Cancel', role: 'cancel' },
                {
                    text: 'Delete',
                    role: 'destructive',
                    handler: async () => {
                        try {
                            await this.playersService.delete(p.id);
                            await this.load();
                        } catch (e: any) {
                            await this.showError(e?.message ?? 'Could not delete player.');
                        }
                    },
                },
            ],
        });

        await alert.present();
    }

    private async showError(message: string) {
        const alert = await this.alertCtrl.create({
            header: 'Error',
            message,
            buttons: ['OK'],
        });
        await alert.present();
    }
}