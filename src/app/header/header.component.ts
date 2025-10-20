import { AsyncPipe } from '@angular/common';
import { AuthService } from './../core/auth/auth.service';
import { Component, computed, HostListener, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { User, UserType } from '../features/user/user.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [RouterLink, AsyncPipe],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, OnDestroy {
  private authservice = inject(AuthService);

  user$ = this.authservice.user$;
  isLoggedIn$ = this.authservice.isLoggedIn$();
  userSub!: Subscription;
  user = signal<User | null | undefined>(null);

  AreAllNotifRead = computed(
    () => {
      return this.user()?.notifications?.findIndex(
        (notif) => !notif.isRead
      ) === -1
    }
  )

  menuOpen = signal(false);
  mobileOpen = signal(false);


  constructor() {}

  ngOnInit(): void {
    this.userSub = this.authservice.user$.subscribe(
      newUser => {
        this.user.set(newUser ? { ...newUser } : null);
      }
    )
  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
  }

  toggleMenu() {
    this.menuOpen.set(!this.menuOpen());
  }

  toggleMobile() {
    this.mobileOpen.set(!this.mobileOpen());
  }
  logout() {
    this.authservice.logout();
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    const target = event.target as HTMLElement;
    const menu = document.getElementById('avatarMenu');
    const avatar = document.getElementById('avatarButton');

    if (menu && avatar && !menu.contains(target) && !avatar.contains(target)) {
      this.menuOpen.set(false);
    }
  }

  default_pdp(role: UserType): string {
    const base_pdp_url = '/default_pdp/';
    switch(role) {
      case 'ETUDIANT': {
        return base_pdp_url + 'student.png';
      }
      case 'ENSEIGNANT': {
        return base_pdp_url + 'teacher.png';
      }
      case 'ANCIEN': {
        return base_pdp_url + 'former.png';
      }
      default: {
        return base_pdp_url + 'user.png';
      }
    }
  }
}