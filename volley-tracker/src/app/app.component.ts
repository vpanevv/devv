import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { RouterOutlet, Router } from '@angular/router';

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
    await this.coachService.init();

    const coaches = await this.coachService.listCoaches();
    const active = this.coachService.activeCoachId;

    const alert = await this.alertCtrl.create({
      header: 'Switch coach',
      inputs: [
        ...coaches.map(c => ({
          type: 'radio' as const,
          label: c.name,
          value: c.id,
          checked: c.id === active,
        })),
        { type: 'radio', label: '➕ New coach…', value: '__NEW__' },
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Select',
          handler: async (value) => {
            if (value === '__NEW__') {
              await this.router.navigateByUrl('/setup');
              return;
            }
            if (typeof value === 'string' && value) {
              await this.coachService.setActiveCoach(value);
              await this.router.navigateByUrl('/groups');
            }
          },
        },
      ],
    });

    await alert.present();
  }
}