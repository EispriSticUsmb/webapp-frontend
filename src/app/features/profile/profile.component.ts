import { PartialUser, UserType } from './../user/user.model';
import { AfterViewInit, Component, ElementRef, inject, OnDestroy, OnInit, PLATFORM_ID, signal, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { User } from '../user/user.model';
import { UserService } from '../../core/user/user.service';
import { HttpErrorResponse } from '@angular/common/http';
import { SpinnerComponent } from "../spinner/spinner.component";
import { environment } from '../../../environments/environment';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-profile.component',
  imports: [ReactiveFormsModule, SpinnerComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit, OnDestroy, AfterViewInit{
  private formBuilder = inject(FormBuilder);
  private auth = inject(AuthService);
  private userService = inject(UserService);
  private platformId = inject(PLATFORM_ID);
  errorMessage = signal<String | null>(null);
  userSub!: Subscription;
  user: User | undefined | null;
  viewInit: boolean = false;

  @ViewChild('ProfilePicture') profilePictureDOM!: ElementRef<HTMLImageElement>;

  ngOnInit(): void {
    this.userSub = this.auth.user$.subscribe(
      user => {
        this.user = user;
        if(user) {
          if(this.email.pristine) {
            this.email.setValue(user.email);
          }
          if(this.username.pristine) {
            this.username.setValue(user.username);
          }
          if(this.firstName.pristine) {
            this.firstName.setValue(user.firstName);
          }
          if(this.lastName.pristine) {
            this.lastName.setValue(user.lastName);
          }
          if(this.UserType.pristine) {
            this.UserType.setValue(user.userType);
          }
          if(this.viewInit && this.profilePicture.pristine && user.profileImage) {
            this.profilePictureDOM.nativeElement.src = user.profileImage
          }
        }
      }
    );
  }

  newPP (event: Event) {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length !==1)
      return;

    const file = input.files[0];

    const reader = new FileReader();
    reader.onload = () => {
      this.profilePictureDOM.nativeElement.src = reader.result as string;
    };
    reader.readAsDataURL(file);
    this.userService.updatePP(this.user!.id, file).subscribe({
      next: () => {
        const user = this.user
        if(user?.profileImage) {
          if (user.profileImage.startsWith('/default_pdp/')){
            let envApiUrl = environment.apiUrl;
            if(envApiUrl.endsWith('/')){
              envApiUrl = envApiUrl.substring(0, envApiUrl.length - 1);
            }
            user.profileImage = envApiUrl + '/users/' + user.id + '/profileImage';
          }
          user.profileImage = user.profileImage.split('?')[0] + '?cache='+Date.now();
          this.profilePictureDOM.nativeElement.src = user.profileImage;
        }
        this.auth.updateUser(user);
      },

      error: (err : HttpErrorResponse) => {
        if(err.status){
          this.errorMessage.set(err.error?.message || 'Oups ! Impossible de se connecter pour le moment')
        } else {
          this.errorMessage.set("Oups ! Impossible de se connecter pour le moment")
        }
      }
    });
  }

  AreUserInfoUpdating = signal<boolean>(false);
  submit() {
    const partialUser: PartialUser = {};
    this.AreUserInfoUpdating.set(true);
    if(this.email.dirty && this.email.value?.trim() !== this.user?.email)
      partialUser.email = this.email.value!.trim();
    if(this.username.dirty && this.username.value?.trim() !== this.user?.username)
      partialUser.username = this.username.value!.trim();
    if(this.firstName.dirty && this.firstName.value?.trim() !== this.user?.firstName)
      partialUser.firstName = this.firstName.value!.trim();
    if(this.lastName.dirty && this.lastName.value?.trim() !== this.user?.lastName)
      partialUser.lastName = this.lastName.value!.trim();
    if(this.UserType.dirty && (this.UserType.value as UserType) !== this.user?.userType)
      partialUser.userType = this.UserType.value! as UserType;
    this.userService.pathUser(this.user!.id, partialUser).subscribe({
      next: (newUser) => {
        this.AreUserInfoUpdating.set(false);
        this.errorMessage.set(null);
        this.auth.updateUser(newUser);
      },

      error: (err : HttpErrorResponse) => {
        this.AreUserInfoUpdating.set(false);
        if(err.status){
          this.errorMessage.set(err.error?.message || 'Oups ! Impossible de se connecter pour le moment')
        } else {
          this.errorMessage.set("Oups ! Impossible de se connecter pour le moment")
        }
      }
    });
  }

  ngAfterViewInit(): void {
    this.viewInit = true;
    if(this.user) {
        if(this.profilePicture.pristine && this.user.profileImage) {
          this.profilePictureDOM.nativeElement.src = this.user.profileImage
        }
    }
  }

  ngOnDestroy(): void {
    this.viewInit = false;
    this.userSub.unsubscribe();
  }

  registerForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(64)]],
    username: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._-]+$/), Validators.maxLength(16), Validators.minLength(3)]],
    firstName: ['', [Validators.required, Validators.pattern(/^[A-Za-zÀ-ÖØ-öø-ÿ'-]+$/), Validators.maxLength(80)]],
    lastName: ['', [Validators.required, Validators.pattern(/^[A-Za-zÀ-ÖØ-öø-ÿ'-]+$/), Validators.maxLength(100)]],
    UserType: ['ETUDIANT', [Validators.required]],
    profilePicture: [null,  [Validators.required]],
  })

  get email() {
    return this.registerForm.get('email')!;
  }

  get username() {
    return this.registerForm.get('username')!;
  }

  get firstName() {
    return this.registerForm.get('firstName')!;
  }

  get lastName() {
    return this.registerForm.get('lastName')!;
  }

  get UserType() {
    return this.registerForm.get('UserType')!;
  }

  get profilePicture() {
    return this.registerForm.get('profilePicture')!;
  }
}
