import { Component, EventEmitter, inject, Output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { AuthService } from '../../../../core/auth/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent{

  private authservice = inject(AuthService);
  loginInProgress = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  loginreq : Subscription | null = null;
  
  @Output() requestSuccess = new EventEmitter();
  loginForm = new FormGroup({
    identifier: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  })

  get password() {
    return this.loginForm.get('password');
  }

  get identifier() {
    return this.loginForm.get('identifier');
  }

  passwordBorderError = this.identifier?.invalid && (this.identifier?.dirty || this.identifier?.touched);

  submit(event: Event) {
    this.loginInProgress.set(true);
    this.loginreq = this.authservice.login( (this.identifier?.value ?? '').trim() , this.password?.value ?? '' ).subscribe(
      {
        next: data => {
          this.loginInProgress.set(false);
          this.requestSuccess.emit();
          this.errorMessage.set(null);
        },
        error: (err : HttpErrorResponse) => {
          if(err.status){
            this.errorMessage.set(err.error?.message || 'Oups ! Impossible de se connecter pour le moment')
          } else {
            this.errorMessage.set("Oups ! Impossible de se connecter pour le moment")
          }
          this.loginInProgress.set(false);
        }
      }
    )
  }
}
