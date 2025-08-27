import { inject, Injectable } from '@angular/core';
import { CanMatch, Route, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, take, map, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class adminGuard implements CanMatch {
  private router = inject(Router);
  private auth = inject(AuthService);

  canActivate(): Observable<boolean> {
    return this.auth.user$.pipe(
      filter(u => u !== undefined),
      take(1),
      map(user => !!user && user.role==='ADMIN'),
      tap(isLoggedIn => {
        if (!isLoggedIn) this.router.navigate(['/']);
      })
    );
  }

  canMatch(route: Route): Observable<boolean> {
    return this.auth.user$.pipe(
      filter(u => u !== undefined),
      take(1),
      map(user => !!user && user.role==='ADMIN'),
      tap(isLoggedIn => {
        if (!isLoggedIn) this.router.navigate(['/login']);
      })
    );
  }
}
