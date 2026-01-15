import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
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
    }, 4000);
  }
}