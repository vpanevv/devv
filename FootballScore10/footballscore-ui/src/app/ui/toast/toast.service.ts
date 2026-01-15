import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
    id: number;
    type: ToastType;
    title?: string;
    message: string;
    timeoutMs?: number; // default 3000
}

@Injectable({ providedIn: 'root' })
export class ToastService {
    private readonly _items = new BehaviorSubject<ToastItem[]>([]);
    readonly items$ = this._items.asObservable();

    private idSeq = 1;

    show(toast: Omit<ToastItem, 'id'>) {
        const id = this.idSeq++;
        const item: ToastItem = {
            id,
            timeoutMs: toast.timeoutMs ?? 3000,
            ...toast,
        };

        this._items.next([...this._items.value, item]);

        if (item.timeoutMs && item.timeoutMs > 0) {
            window.setTimeout(() => this.dismiss(id), item.timeoutMs);
        }
    }

    success(message: string, title = 'Success') {
        this.show({ type: 'success', title, message });
    }

    error(message: string, title = 'Error') {
        this.show({ type: 'error', title, message, timeoutMs: 4500 });
    }

    info(message: string, title = 'Info') {
        this.show({ type: 'info', title, message });
    }

    dismiss(id: number) {
        this._items.next(this._items.value.filter(x => x.id !== id));
    }

    clear() {
        this._items.next([]);
    }
}