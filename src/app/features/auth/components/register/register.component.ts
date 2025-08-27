import { Component, EventEmitter, inject, Output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { UserType } from '../../../user/user.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  @Output() requestSuccess = new EventEmitter();

  private formBuilder = inject(FormBuilder);
  private authservice = inject(AuthService);
  RegisterInProgress = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  registerReq : Subscription | null = null;

  registerForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    UserType: ['ETUDIANT', [Validators.required]],
  })

  get email() {
    return this.registerForm.get('email');
  }

  get username() {
    return this.registerForm.get('username');
  }

  get password() {
    return this.registerForm.get('password');
  }

  get firstName() {
    return this.registerForm.get('firstName');
  }

  get lastName() {
    return this.registerForm.get('lastName');
  }

  get UserType() {
    return this.registerForm.get('UserType');
  }

  
  submit(event: Event) {
    this.RegisterInProgress.set(true);
    this.registerReq = this.authservice.register(
      (this.email?.value ?? '').trim(),
      this.password?.value ?? '',
      (this.username?.value ?? '').trim(),
      (this.firstName?.value ?? '').trim(),
      (this.lastName?.value ?? '').trim(),
      (this.UserType?.value ?? 'ETUDIANT') as UserType
    ).subscribe({
      next: data => {
        this.RegisterInProgress.set(false);
        this.requestSuccess.emit();
        this.errorMessage.set(null);
      },
      error: (err: HttpErrorResponse) => {
          if(err.status){
            this.errorMessage.set(err.error?.message || 'Oups ! Impossible de se connecter pour le moment')
          } else {
            this.errorMessage.set("Oups ! Impossible de se connecter pour le moment")
          }
          this.RegisterInProgress.set(false);
      }
    })
  }
}
