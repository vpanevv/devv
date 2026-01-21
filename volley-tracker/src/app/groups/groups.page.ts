import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { Subject, takeUntil } from 'rxjs';

import { GroupsService } from '../core/groups.service';
import { CoachService } from '../core/coach.service';
import { Group } from '../core/models';

@Component({
    selector: 'app-groups',
    standalone: true,
    imports: [CommonModule, IonicModule],
    templateUrl: './groups.page.html',
})
export class GroupsPage implements OnDestroy {
    groups: Group[] = [];
    coachName: string | null = null;

    isLoading = true;
    error: string | null = null;

    private destroy$ = new Subject<void>();

    constructor(
        private groupsService: GroupsService,
        private coachService: CoachService,
        private alertCtrl: AlertController
    ) {
        // 🔥 instant reload when coach changes
        this.coachService.activeCoachId$
            .pipe(takeUntil(this.destroy$))
            .subscribe(async () => {
                await this.load();
            });
    }

    async ionViewWillEnter() {
        await this.load();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private async load() {
        this.isLoading = true;
        this.error = null;

        try {
            await this.coachService.init();
            const coach = await this.coachService.getActiveCoach();
            this.coachName = coach?.name ?? null;

            this.groups = await this.groupsService.getAll();
        } catch (e: any) {
            console.error(e);
            this.error = e?.message ?? 'Failed to load groups.';
            this.groups = [];
        } finally {
            this.isLoading = false;
        }
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
            message: `This will remove <b>${g.name}</b>.`,
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