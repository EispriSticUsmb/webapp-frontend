import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, switchMap, skip, take } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { isPlatformBrowser } from '@angular/common';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export function authInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  const platformId = inject(PLATFORM_ID);
  if (!isPlatformBrowser(platformId)) {
    return next(req);
  }
  const authService = inject(AuthService);
  const accessToken = authService.getAccessToken();

  let authReq = req;
  if (accessToken) {
    authReq = addTokenHeader(req, accessToken);
  }

  return next(authReq).pipe(
    catchError(err => {
      if (err.status === 401 && !req.url.includes('/auth/refresh') && !req.url.includes('/auth/logout')
        && !req.url.includes('/auth/login') 
        && err.error.message==='Access denied: invalid or expired token') {
        return handle401Error(req, next, authService, err);
      }
      return throwError(() => err);
    })
  );
}

function addTokenHeader(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}

function handle401Error(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
  originalError: any
): Observable<HttpEvent<unknown>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap((newAccessToken: string) => {
        isRefreshing = false;
        refreshTokenSubject.next(newAccessToken);
        return next(addTokenHeader(req, newAccessToken));
      }),
      catchError(err => {
        isRefreshing = false;
        refreshTokenSubject.next(null);
        if(
          err.status === 401
          && err.error.message==='Access denied: invalid or expired token'
        ) {
          var errToReturn = originalError;
          authService.logout();
        } else {
          var errToReturn = err;
        }
        return throwError(() => errToReturn);
      })
    );
  } else {
    return refreshTokenSubject.pipe(
      skip(1),
      take(1),
      switchMap(token => {
        if (token) {
          return next(addTokenHeader(req, token));
        } else {
          return throwError(() => originalError);
        }
      })
    );
  }
}