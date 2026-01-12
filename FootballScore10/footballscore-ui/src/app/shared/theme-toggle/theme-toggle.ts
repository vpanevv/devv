import { Component, inject } from '@angular/core';
import { DOCUMENT, CommonModule } from '@angular/common';

type Theme = 'dark' | 'light';

@Component({
    selector: 'app-theme-toggle',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './theme-toggle.html',
    styleUrls: ['./theme-toggle.scss'],
})
export class ThemeToggleComponent {
    private doc = inject(DOCUMENT);

    theme: Theme = 'dark';

    constructor() {
        const saved = localStorage.getItem('theme') as Theme | null;
        this.theme = saved ?? 'dark';
        this.apply();
    }

    toggle(): void {
        this.theme = this.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', this.theme);
        this.apply();
    }

    private apply(): void {
        // light => data-theme="light", dark => махаме атрибута
        if (this.theme === 'light') {
            this.doc.documentElement.setAttribute('data-theme', 'light');
        } else {
            this.doc.documentElement.removeAttribute('data-theme');
        }
    }
}