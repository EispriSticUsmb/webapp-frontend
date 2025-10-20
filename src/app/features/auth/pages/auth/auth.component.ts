import { Router } from '@angular/router';
import { AuthService } from './../../../../core/auth/auth.service';
import { Component, inject, OnInit, signal } from '@angular/core';
import { LoginComponent } from "../../components/login/login.component";
import { RegisterComponent } from "../../components/register/register.component";
import { take } from 'rxjs';
import { Location } from '@angular/common';

@Component({
  selector: 'app-auth',
  imports: [LoginComponent, RegisterComponent],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent implements OnInit {
  private authservice = inject(AuthService);
  isLoggedIn: boolean = false;
  router = inject(Router);
  location = inject(Location);
  activeTab = signal<'register' | 'login'>('login');

  ReqSuccess() {
    this.router.navigate(['/']);
  }

  SwitchTab(tab: string) {
    if(tab==='register') {
      this.location.go("/register");
      this.activeTab.set('register');
    }
    else {
      this.location.go("/login");
      this.activeTab.set('login');
    }
  }

  ngOnInit(): void {
    if (this.router.url === '/register') {
      this.activeTab.set('register');
    } else {
      this.activeTab.set('login');
    }
    this.authservice.isLoggedIn$().pipe(take(1)).subscribe(isLoggedIn =>  {
      if(isLoggedIn) {
        this.router.navigate(['/']);
      }
    })
  }
}
