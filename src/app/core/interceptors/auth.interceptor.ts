import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { isPlatformBrowser } from '@angular/common';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export function authInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  const platformId = inject(PLATFORM_ID);
  const authService = inject(AuthService);

  if (!isPlatformBrowser(platformId) || req.url.includes('/auth/logout')) {
    return next(req);
  }

  const accessToken = authService.getAccessToken();
  let authReq = req;

  if (accessToken) {
    authReq = addTokenHeader(req, accessToken);
  }

  return next(authReq).pipe(
    catchError(error => {
      if (
        error.status === 401 &&
        !req.url.includes('/auth/refresh') &&
        !req.url.includes('/auth/login')
      ) {
        return handle401Error(req, next, authService);
      }
      return throwError(() => error);
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
  authService: AuthService
): Observable<HttpEvent<unknown>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap(newAccessToken => {
        isRefreshing = false;
        refreshTokenSubject.next(newAccessToken);
        return next(addTokenHeader(req, newAccessToken));
      }),
      catchError(err => {
        isRefreshing = false;
        authService.logout();
        return throwError(() => err);
      })
    );
  } else {
    return refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => {
        return next(addTokenHeader(req, token!));
      })
    );
  }
}