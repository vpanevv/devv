import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonText,
    IonSpinner,
} from '@ionic/angular/standalone';
import { CoachService } from '../../core/coach.service';

@Component({
    selector: 'app-setup',
    standalone: true,
    imports: [
        FormsModule,
        IonContent,
        IonCard,
        IonCardHeader,
        IonCardTitle,
        IonCardSubtitle,
        IonCardContent,
        IonItem,
        IonLabel,
        IonInput,
        IonButton,
        IonText,
        IonSpinner,
    ],
    templateUrl: './setup.page.html',
    styleUrls: ['./setup.page.scss'],
})
export class SetupPage {
    coachName = '';
    isSaving = false;
    error: string | null = null;

    constructor(private coachService: CoachService, private router: Router) { }

    async continue() {
        console.log('[SetupPage] continue() clicked');

        const name = (this.coachName ?? '').trim();
        if (!name) {
            this.error = 'Please enter a coach name.';
            return;
        }

        this.error = null;
        this.isSaving = true;

        try {
            console.log('[SetupPage] creating coach...', name);
            const coach = await this.coachService.create(name);
            console.log('[SetupPage] coach created:', coach);

            console.log('[SetupPage] setting active coach...', coach.id);
            await this.coachService.setActiveCoachId(coach.id);
            console.log('[SetupPage] active coach set');

            console.log('[SetupPage] navigating to /groups');
            await this.router.navigateByUrl('/groups', { replaceUrl: true });
        } catch (e: any) {
            console.error('[SetupPage] continue() failed', e);
            this.error = e?.message ?? 'Could not create coach.';
        } finally {
            this.isSaving = false;
        }
    }
}