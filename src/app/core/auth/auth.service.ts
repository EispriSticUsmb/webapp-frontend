import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, filter, map, tap } from 'rxjs/operators';
import { Notification, User, UserType } from '../../features/user/user.model';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly accessToken$ = new BehaviorSubject<string | null>(null);
  readonly _user$ = new BehaviorSubject<User | null | undefined>(undefined); 
  private router = inject(Router);
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  
  get user$(): Observable<User | null | undefined> {
    return this._user$.asObservable();
  }

  get userCurrentValue(): User | null | undefined {
    return this._user$.value;
  }

  updateUser(user: User | null | undefined) {
    this._user$.next(user);
  }

  logout(): void {
    this.http.post('/auth/logout', null, { withCredentials : true }).subscribe()
    this.accessToken$.next(null);
    this._user$.next(null);
  }

  private default_pdp(role: UserType): string {
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

  loadUser() {
    this.http.get<User>('/users/me').pipe(
      map(user => {
        if (!user.profileImage || user.profileImage.startsWith('/default_pdp/')){
          user.profileImage = this.default_pdp(user.userType);
        }
        else {
          if (isPlatformBrowser(this.platformId)) {
            let envApiUrl = environment.apiUrl;
            if(envApiUrl.endsWith('/')){
              envApiUrl = envApiUrl.substring(0, envApiUrl.length - 1);
            }
            user.profileImage = envApiUrl + '/users/' + user.id + '/profileImage';
          } else {
              let envApiUrl = process.env['API_URL_SSR'] || environment.apiUrl;
              if(envApiUrl.endsWith('/')){
                envApiUrl = envApiUrl.substring(0, envApiUrl.length - 1);
              }
              user.profileImage = envApiUrl + '/users/' + user.id + '/profileImage';
          }
        }
        return user;
      }),
      tap(user => {
        this._user$.next(user);
      }),
      catchError((err) => {
        this._user$.next(null);
        return of(null);
      })
    ).subscribe();
  }

  login(identifier: string, password: string): Observable<void> {
    return this.http.post<{authtokens: string, user: User}>('/auth/login', { identifier, password }, { withCredentials: true}).pipe(
      map( ({authtokens, user }) => {
        if (!user.profileImage || user.profileImage.startsWith('/default_pdp/')){
          user.profileImage = this.default_pdp(user.userType);
        }
        else {
          if (isPlatformBrowser(this.platformId)) {
            let envApiUrl = environment.apiUrl;
            if(envApiUrl.endsWith('/')){
              envApiUrl = envApiUrl.substring(0, envApiUrl.length - 1);
            }
            user.profileImage = envApiUrl + '/users/' + user.id + '/profileImage';
          } else {
              let envApiUrl = process.env['API_URL_SSR'] || environment.apiUrl;
              if(envApiUrl.endsWith('/')){
                envApiUrl = envApiUrl.substring(0, envApiUrl.length - 1);
              }
              user.profileImage = envApiUrl + '/users/' + user.id + '/profileImage';
          }
        }
        return {authtokens, user };
      }),
      tap( ({authtokens, user }) => {
        this._user$.next(user);
        this.accessToken$.next(authtokens);
      }),
      map(() => void 0),
    );
  }

  register(email: string, password: string, username: string, firstName: string, lastName: string, userType: UserType): Observable<void> {
    return this.http.post<{authtokens: string, user: User}>("/auth/register", {
      email, password, username, firstName, lastName, userType
    }, { withCredentials: true}).pipe(
      map( ({authtokens, user }) => {
        user.profileImage = this.default_pdp(user.userType);
        return {authtokens, user };
      }),
      tap( ({authtokens, user }) => {
        this._user$.next(user);
        this.accessToken$.next(authtokens);
      }),
      map(() => void 0),
    );
  }

  getAccessToken(): string | null {
    return this.accessToken$.value;
  }

  getAccessTokenStream(): Observable<string | null> {
    return this.accessToken$.asObservable();
  }

  isLoggedIn$(): Observable<boolean> {
    return this._user$.pipe(
      filter(user => user !== undefined),
      map(user => !!user)
    );
  }

  refreshToken(): Observable<string> {
    return this.http.post<{ accessToken: string }>('/auth/refresh', {}, { withCredentials: true }).pipe(
      tap(res => this.accessToken$.next(res.accessToken)),
      map(res => res.accessToken),
      catchError(err => {
        this.logout();
        return throwError(() => err);
      })
    );
  }

  refreshTokenSSR(refreshToken: string): Observable<string> {
    return this.http.post<{ accessToken: string }>(
      '/auth/refresh',
      null,
      {
        headers: new HttpHeaders().set("x-refresh-token", refreshToken)
      }
    ).pipe(
      tap(res => this.accessToken$.next(res.accessToken)),
      map(res => res.accessToken)
    );
  }

  UpdateNotif(notifId: string, notif: Notification) {
    const user = this.userCurrentValue;
    if(user) {
      const index = user.notifications?.findIndex(notif => notif.id===notifId);
      if(index && index !== -1) {
        user.notifications![index] = notif;
        this._user$.next(user);
      }
    }
  }
}
