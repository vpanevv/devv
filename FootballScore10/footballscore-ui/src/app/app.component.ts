import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastContainerComponent } from './ui/toast/toast-container';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, ToastContainerComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class AppComponent implements OnInit {
  showSplash = true;

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.showSplash = true;

    setTimeout(() => {
      this.showSplash = false;
      this.cdr.detectChanges();
    }, 2200);
  }
}