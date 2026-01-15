import { Component, signal } from '@angular/core';
import { RouterOutlet, } from '@angular/router';
import { ThemeToggleComponent } from './shared/theme-toggle/theme-toggle';
import { ToastContainerComponent } from './ui/toast/toast-container';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ThemeToggleComponent, ToastContainerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('footballscore-ui');
}
