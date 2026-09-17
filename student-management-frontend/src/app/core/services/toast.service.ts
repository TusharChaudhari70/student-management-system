import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  text: string;
  type: 'success' | 'error';
  closing?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly messages = signal<ToastMessage[]>([]);
  private nextId = 1;
  private installed = false;

  installAlertHandler(): void {
    if (this.installed || typeof window === 'undefined') return;
    this.installed = true;
    window.alert = (message?: unknown) => this.show(String(message ?? ''));
  }

  show(text: string): void {
    const id = this.nextId++;
    const type = /failed|error|not found|invalid|cannot|unable|please select/i.test(text) ? 'error' : 'success';
    this.messages.update(messages => [...messages, { id, text, type }]);
    window.setTimeout(() => this.beginDismiss(id), 1900);
    window.setTimeout(() => this.dismiss(id), 2400);
  }

  private beginDismiss(id: number): void {
    this.messages.update(messages => messages.map(message => message.id === id ? { ...message, closing: true } : message));
  }

  dismiss(id: number): void {
    this.messages.update(messages => messages.filter(message => message.id !== id));
  }
}
