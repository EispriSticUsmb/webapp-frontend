import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { SpinnerComponent } from "../../../spinner/spinner.component";

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, SpinnerComponent],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router)

  token : String | undefined = this.route.snapshot.queryParams['token'];
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  formPassword = new FormGroup({
    password: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(32)])
  });
  get password() {
    return this.formPassword.get('password')!;
  }
  resetPasswordReqSub: Subscription | undefined;
  resetInProgress = signal<boolean>(false);
  clickPasswordReset() {
    this.resetInProgress.set(true);
    this.successMessage.set(null);
    this.resetPasswordReqSub = this.authService.resetPassword(this.password.value!, this.token!).subscribe({
      next: () => {
        this.resetInProgress.set(false);
        this.errorMessage.set(null);
        this.router.navigate(["/login"]);
      },
      error: (err: HttpErrorResponse) => {
          if(err.status){
            if(err.status==401) {
              this.errorMessage.set("Ce lien a expiré");
            } else {
              this.errorMessage.set(err.error?.message || 'Oups ! Impossible de se connecter pour le moment')
            }
          } else {
            this.errorMessage.set("Oups ! Impossible de se connecter pour le moment")
          }
          this.resetInProgress.set(false);
      }
    }
    );
  }

  formEmail = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(32)])
  });
  get email() {
    return this.formEmail.get('email')!;
  }
  sendResetPasswordEmailSub: Subscription | undefined;
  clickSendEmail() {
    this.resetInProgress.set(true);
    this.successMessage.set(null);
    this.sendResetPasswordEmailSub = this.authService.sendResetPasswordEmail(this.email.value!).subscribe({
      next: () => {
        this.resetInProgress.set(false);
        this.errorMessage.set(null);
        this.successMessage.set("Email envoyé, Vérifiez vos spams");
      },
      error: (err: HttpErrorResponse) => {
          if(err.status){
            if(err.status==429) {
              this.errorMessage.set("Vous devez attendre 5 minutes avant d'envoyer une autre requête");
            } else {
              this.errorMessage.set(err.error?.message || 'Oups ! Impossible de se connecter pour le moment')
            }
          } else {
            this.errorMessage.set("Oups ! Impossible de se connecter pour le moment")
          }
          this.resetInProgress.set(false);
      }
    }
    );
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParams['token'];
    this.resetInProgress.set(false);
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  ngOnDestroy(): void {
    this.resetPasswordReqSub?.unsubscribe();
    this.sendResetPasswordEmailSub?.unsubscribe();
  }
}
