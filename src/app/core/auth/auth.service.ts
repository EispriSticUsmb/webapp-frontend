import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, filter, map, tap } from 'rxjs/operators';
import { User, UserType } from '../../features/user/user.model';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly accessToken$ = new BehaviorSubject<string | null>(null);
  private readonly _user$ = new BehaviorSubject<User | null | undefined>(undefined); 
  private router = inject(Router);
  private http = inject(HttpClient);
  
  get user$(): Observable<User | null | undefined> {
    return this._user$.asObservable();
  }

  logout(): void {
    this.http.post('/auth/logout', null, { withCredentials : true }).subscribe()
    this.accessToken$.next(null);
    this._user$.next(null);
    this.router.navigate(['/']);
  }
  
  loadUser() {
    this.http.get<User>('/users/me').pipe(
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
}
