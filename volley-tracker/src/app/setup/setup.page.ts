import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { GroupsService } from '../core/groups.service';

@Component({
    selector: 'app-setup',
    standalone: true,
    imports: [CommonModule, FormsModule, IonicModule],
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
        const existing = await this.groupsService.getCoachName();
        if (existing) {
            await this.router.navigateByUrl('/groups', { replaceUrl: true });
        }
    }

    async save() {
        const name = (this.coachName ?? '').trim();
        if (!name) {
            await this.showError('Please enter your name.');
            return;
        }

        this.isSaving = true;
        try {
            await this.groupsService.setCoachName(name);
            await this.router.navigateByUrl('/groups', { replaceUrl: true });
        } catch (e: any) {
            console.error(e);
            await this.showError(e?.message ?? 'Could not save your name.');
        } finally {
            this.isSaving = false;
        }
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