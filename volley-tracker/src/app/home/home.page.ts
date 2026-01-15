import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  coachName = '';
  savedCoachName: string | null = null;
  error: string | null = null;

  constructor() {
    this.savedCoachName = localStorage.getItem('coachName');
  }

  save(): void {
    this.error = null;

    const name = this.coachName.trim();
    if (!name) {
      this.error = 'Please enter your name.';
      return;
    }

    localStorage.setItem('coachName', name);
    this.savedCoachName = name;
    this.coachName = '';
  }

  changeCoach(): void {
    localStorage.removeItem('coachName');
    this.savedCoachName = null;
    this.error = null;
  }
}