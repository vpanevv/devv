import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { GroupsService } from '../core/groups.service';

@Component({
    selector: 'app-setup',
    standalone: true,
    imports: [CommonModule, IonicModule, FormsModule],
    templateUrl: './setup.page.html',
})
export class SetupPage {
    coachName = '';
    isSaving = false;

    constructor(
        private groupsService: GroupsService,
        private router: Router,
        private alertCtrl: AlertController
    ) { }

    async ionViewWillEnter() {
        const name = await this.groupsService.getCoachName();
        if (name) {
            await this.router.navigateByUrl('/groups', { replaceUrl: true });
        }
    }

    async save() {
        const name = (this.coachName || '').trim();
        if (!name) {
            const a = await this.alertCtrl.create({
                header: 'Validation',
                message: 'Please enter a coach name.',
                buttons: ['OK'],
            });
            await a.present();
            return;
        }

        this.isSaving = true;
        try {
            await this.groupsService.setCoachName(name);
            await this.router.navigateByUrl('/groups', { replaceUrl: true });
        } catch (e: any) {
            const a = await this.alertCtrl.create({
                header: 'Error',
                message: e?.message ?? 'Could not save coach name.',
                buttons: ['OK'],
            });
            await a.present();
        } finally {
            this.isSaving = false;
        }
    }
}