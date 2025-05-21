import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
  timeout?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$: Observable<Notification[]> = this.notificationsSubject.asObservable();

  constructor() { }

  /**
   * Add a new notification
   * @param notification The notification to add
   */
  add(notification: Omit<Notification, 'id'>): void {
    const id = this.generateId();
    const newNotification = { ...notification, id };
    
    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([...currentNotifications, newNotification as Notification]);
    
    // Auto-remove notification after timeout if specified
    if (notification.timeout) {
      setTimeout(() => this.remove(id), notification.timeout);
    }
  }

  /**
   * Remove a notification by id
   * @param id The id of the notification to remove
   */
  remove(id: string): void {
    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next(
      currentNotifications.filter(notification => notification.id !== id)
    );
  }

  /**
   * Clear all notifications
   */
  clear(): void {
    this.notificationsSubject.next([]);
  }

  /**
   * Helper methods for different notification types
   */
  success(message: string, timeout = 5000): void {
    this.add({ type: 'success', message, timeout });
  }

  info(message: string, timeout = 5000): void {
    this.add({ type: 'info', message, timeout });
  }

  warning(message: string, timeout = 7000): void {
    this.add({ type: 'warning', message, timeout });
  }

  error(message: string, timeout?: number): void {
    this.add({ type: 'error', message, timeout });
  }

  /**
   * Generate a unique ID for notifications
   */
  private generateId(): string {
    return Math.random().toString(36).substring(2, 11);
  }
}
