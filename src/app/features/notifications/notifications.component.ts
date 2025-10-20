import { Subscription } from 'rxjs';
import { Component, inject, OnDestroy, OnInit, PLATFORM_ID, signal, WritableSignal } from '@angular/core';
import { Notification, User } from '../user/user.model';
import { AuthService } from '../../core/auth/auth.service';
import { Router } from '@angular/router';
import { UserService } from '../../core/user/user.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { NotificationService } from '../../core/user/notifications.service';

@Component({
  selector: 'app-notifications',
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})
export class NotificationsComponent implements OnInit, OnDestroy {
  auth = inject(AuthService);
  userService = inject(UserService);
  router = inject(Router);
  notifService = inject(NotificationService);
  platformId = inject(PLATFORM_ID);
  user: WritableSignal<User | null> = signal<User | null>(null);
  userSub!: Subscription;
  usersSubs: Subscription[] = [];
  MarkNotif = false;

  ngOnInit(): void {
    this.MarkNotif = false;
    this.userSub = this.auth.user$.subscribe( user => {
      if(user) {
        if(!this.MarkNotif && isPlatformBrowser(this.platformId)) {
          this.MarkNotif = true;
          this.markAllNotifAsRead(user);
        }
        this.loadFullNotification(user);
      }  else {
        this.router.navigate(['/']);
      }
    });
  }

  OnClickNotif(notif: Notification) {
    switch (notif.type) {
      case 'GENERAL':
        if(notif.link) {
          if(notif.link.startsWith('http')) {
            window.location.href = notif.link;
          }
          else this.router.navigate([notif.link]);
        } 
        break;
    
      default:
        if(notif.link) this.router.navigate(['/team',notif.link]);
        break;
    }
  }

  deleteNotif(notifId: string) {
    this.notifService.deleteNotif(notifId).subscribe(
      () => {
        const user = this.user();
        if(user && user.notifications) {
          user.notifications = user.notifications.filter(n => n.id !== notifId);
          this.auth.updateUser(user);
        }
      }
    )
  }

  ngOnDestroy(): void {
    this.MarkNotif = false;
    this.userSub.unsubscribe();
    this.usersSubs.forEach( sub => sub.unsubscribe());
  }

  markAllNotifAsRead(user : User) {
    user.notifications?.forEach(
      notif => {
        if(!notif.isRead) {
          this.notifService.markNotifAdRead(notif.id).subscribe(Newnotif => {
            this.auth.UpdateNotif(notif.id, Newnotif);
          });
        }
      }
    )
  }

  loadFullNotification(user: User) {
      this.usersSubs.forEach(sub => sub.unsubscribe());
      this.usersSubs = [];
      this.user.set(user ? { ...user } : null);
      user.notifications?.forEach(
        (notif) => {
          const userId = notif.fromUserId
          if(!notif.fromUser && userId) {
            this.usersSubs.push(
              this.userService.getUser$(userId).subscribe(
                user => {
                  if(user===undefined) {
                    this.userService.getUser(userId).subscribe({
                      next: (user) => {
                        this.userService.updateUser(userId, user);
                      },
                      error: () => {
                        this.userService.updateUser(userId, null);
                      },
                    })
                  } else {
                    this.user.update(current => {
                      if (current) {
                        return {
                          ...current,
                          notifications: current.notifications?.map(n =>
                            n.fromUserId === userId
                              ? { ...n, fromUser: user ?? undefined }
                              : n
                          ),
                        };
                      }
                      return current;
                    });
                  }
                }
              )
            )
          }
        }
      )
  }
}
