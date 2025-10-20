import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Notification } from '../../features/user/user.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
    private http = inject(HttpClient);

    markNotifAdRead(notifId: string): Observable<Notification> {
      return this.http.put<Notification>(`notifications/${notifId}/read`,{});
    }

    deleteNotif(notifId: string): Observable<Notification> {
      return this.http.delete<Notification>(`notifications/${notifId}`);
    }
}
