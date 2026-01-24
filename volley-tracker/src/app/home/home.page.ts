import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonActionSheet
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonActionSheet],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {
  isOpen = false;

  buttons = [
    { text: 'Delete', role: 'destructive', handler: () => console.log('Delete') },
    { text: 'Share', handler: () => console.log('Share') },
    { text: 'Cancel', role: 'cancel' },
  ];

  openActions() {
    this.isOpen = true;
  }
}