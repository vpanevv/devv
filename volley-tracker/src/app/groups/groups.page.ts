import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { GroupsService } from '../core/groups.service';
import { Group } from '../core/models';

@Component({
    selector: 'app-groups',
    standalone: true,
    imports: [CommonModule, IonicModule],
    templateUrl: './groups.page.html',
})
export class GroupsPage {
    coachName: string | null = null;

    groups: Group[] = [];
    playersCountByGroup: Record<string, number> = {};

    isLoading = true;
    error: string | null = null;

    constructor(
        private groupsService: GroupsService,
        private alertCtrl: AlertController,
        private router: Router
    ) { }

    async ionViewWillEnter() {
        this.coachName = await this.groupsService.getCoachName();
        if (!this.coachName) {
            await this.router.navigateByUrl('/setup', { replaceUrl: true });
            return;
        }

        await this.load();
    }

    private async load() {
        this.isLoading = true;
        this.error = null;

        try {
            const state = await this.groupsService.getState();
            this.groups = state.groups ?? [];

            const counts: Record<string, number> = {};
            for (const p of state.players ?? []) {
                counts[p.groupId] = (counts[p.groupId] ?? 0) + 1;
            }
            this.playersCountByGroup = counts;
        } catch (e) {
            console.error(e);
            this.error = 'Failed to load groups.';
        } finally {
            this.isLoading = false;
        }
    }

    async changeName() {
        const alert = await this.alertCtrl.create({
            header: 'Change coach name?',
            message: 'This will take you back to the welcome screen.',
            buttons: [
                { text: 'Cancel', role: 'cancel' },
                {
                    text: 'Change',
                    role: 'destructive',
                    handler: async () => {
                        await this.groupsService.clearCoachName();
                        await this.router.navigateByUrl('/setup', { replaceUrl: true });
                    },
                },
            ],
        });

        await alert.present();
    }

    async addGroup() {
        const alert = await this.alertCtrl.create({
            header: 'New group',
            message: 'Enter group name (e.g. U12, U14, Beginners).',
            inputs: [{ name: 'name', type: 'text', placeholder: 'Group name' }],
            buttons: [
                { text: 'Cancel', role: 'cancel' },
                {
                    text: 'Create',
                    handler: async (data) => {
                        try {
                            await this.groupsService.create(data?.name ?? '');
                            await this.load();
                        } catch (e: any) {
                            await this.showError(e?.message ?? 'Could not create group.');
                        }
                    },
                },
            ],
        });

        await alert.present();
    }

    async renameGroup(g: Group) {
        const alert = await this.alertCtrl.create({
            header: 'Rename group',
            inputs: [{ name: 'name', type: 'text', value: g.name }],
            buttons: [
                { text: 'Cancel', role: 'cancel' },
                {
                    text: 'Save',
                    handler: async (data) => {
                        try {
                            await this.groupsService.rename(g.id, data?.name ?? '');
                            await this.load();
                        } catch (e: any) {
                            await this.showError(e?.message ?? 'Could not rename group.');
                        }
                    },
                },
            ],
        });

        await alert.present();
    }

    async deleteGroup(g: Group) {
        const alert = await this.alertCtrl.create({
            header: 'Delete group?',
            message: `This will remove <b>${g.name}</b> and all its players & attendance history.`,
            buttons: [
                { text: 'Cancel', role: 'cancel' },
                {
                    text: 'Delete',
                    role: 'destructive',
                    handler: async () => {
                        try {
                            await this.groupsService.delete(g.id);
                            await this.load();
                        } catch (e: any) {
                            await this.showError(e?.message ?? 'Could not delete group.');
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