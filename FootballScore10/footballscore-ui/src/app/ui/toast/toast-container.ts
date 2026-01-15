import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from './toast.service';

@Component({
    selector: 'app-toast-container',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './toast-container.html',
    styleUrls: ['./toast-container.scss'],
})
export class ToastContainerComponent {
    constructor(public toast: ToastService) { }

    trackById(_: number, t: any) { return t.id; }
}