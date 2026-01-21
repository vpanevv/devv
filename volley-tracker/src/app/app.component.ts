import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { RouterOutlet, Router } from '@angular/router';
import { AlertInput } from '@ionic/angular';

import { CoachService, Coach } from './core/coach.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterOutlet],
  templateUrl: './app.component.html',
})
export class AppComponent {
  constructor(
    private coachService: CoachService,
    private alertCtrl: AlertController,
    private router: Router
  ) { }

  async switchCoach() {
    const coaches = await this.coachService.getAllCoaches();
    const active = this.coachService.activeCoachId;

    const inputs: AlertInput[] = [
      ...coaches.map(c => ({
        type: 'radio',
        label: c.name,
        value: c.id,
        checked: c.id === active,
      }) as AlertInput),
      {
        type: 'radio',
        label: '➕ New coach',
        value: '__NEW__',
      } as AlertInput,
    ];

    const alert = await this.alertCtrl.create({
      header: 'Switch coach',
      inputs,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Select',
          handler: async (value: string) => {
            if (value === '__NEW__') {
              await this.router.navigateByUrl('/setup');
              return;
            }

            const coach = coaches.find(c => c.id === value);
            if (!coach) return;

            await this.coachService.setActiveCoach(coach);
            await this.router.navigateByUrl('/groups', { replaceUrl: true });
          },
        },
      ],
    });

    await alert.present();
  }
}