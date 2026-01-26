import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import {
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonButtons,
    IonSpinner,
    IonFab,
    IonFabButton,
    IonIcon,
    IonActionSheet,
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { addOutline, trashOutline } from 'ionicons/icons';

import { CoachService, Coach } from '../../core/coach.service';
import { GroupsService, Group } from '../../core/groups.service';

@Component({
    selector: 'app-groups',
    standalone: true,
    imports: [
        CommonModule,
        IonHeader,
        IonToolbar,
        IonTitle,
        IonContent,
        IonList,
        IonItem,
        IonLabel,
        IonButton,
        IonButtons,
        IonSpinner,
        IonFab,
        IonFabButton,
        IonIcon,
        IonActionSheet,
    ],
    templateUrl: './groups.page.html',
    styleUrls: ['./groups.page.scss'],
})
export class GroupsPage {
    coach: Coach | null = null;

    groups: Group[] = [];
    isLoading = true;
    error: string | null = null;

    // ActionSheet state
    isDeleteOpen = false;
    groupToDelete: Group | null = null;

    deleteButtons = [
        {
            text: 'Delete',
            role: 'destructive',
            handler: async () => {
                if (!this.groupToDelete) return;
                await this.deleteGroupConfirmed(this.groupToDelete);
            },
        },
        { text: 'Cancel', role: 'cancel' },
    ];

    constructor(
        private coachService: CoachService,
        private groupsService: GroupsService,
        private router: Router
    ) {
        addIcons({ addOutline, trashOutline });
    }

    async ionViewWillEnter() {
        await this.load();
    }

    private async load() {
        this.isLoading = true;
        this.error = null;

        try {
            this.coach = await this.coachService.getActiveCoach();
            this.groups = await this.groupsService.getAllForActiveCoach();
        } catch (e: any) {
            console.error(e);
            this.error = e?.message ?? 'Failed to load groups.';
        } finally {
            this.isLoading = false;
        }
    }

    async addGroup() {
        // Засега супер просто: създаваме “New group …”
        // След малко ще го направим с красив modal/input като на Setup.
        const name = `Group ${this.groups.length + 1}`;
        await this.groupsService.create(name);
        await this.load();
    }

    openDelete(g: Group) {
        this.groupToDelete = g;
        this.isDeleteOpen = true;
    }

    private async deleteGroupConfirmed(g: Group) {
        await this.groupsService.delete(g.id);
        this.groupToDelete = null;
        await this.load();
    }

    async goToSetup() {
        await this.router.navigateByUrl('/setup', { replaceUrl: true });
    }
}