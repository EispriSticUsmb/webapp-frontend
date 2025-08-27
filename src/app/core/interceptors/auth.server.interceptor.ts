import { AuthService } from './../auth/auth.service';
import {  HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject, makeStateKey, REQUEST, StateKey, TransferState } from '@angular/core';
import { BehaviorSubject, Observable, throwError} from 'rxjs';
import { switchMap, catchError, take, skip} from 'rxjs/operators';

function parseCookies(cookieString: string): Record<string, string> {
  if (!cookieString) return {};
  return cookieString.split(';').reduce((acc, cookie) => {
    const [key, ...v] = cookie.trim().split('=');
    acc[key] = v.join('=');
    return acc;
  }, {} as Record<string, string>);
}

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export function authInterceptorServer(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  const request = inject(REQUEST);
  const authService = inject(AuthService);
  const accessToken = authService.getAccessToken();
  
  const cookies = parseCookies(request?.headers.get('cookie') ?? '')
  const refreshToken = cookies[process.env['REFRESH_TOKEN_NAME'] || 'refresh_token'];
  if (req.url.includes('/auth/refresh')) {
    return next(req);
  }
  
  const transferState = inject(TransferState);
  const key: StateKey<string> = makeStateKey<string>(
      'transfer-' + req.urlWithParams
    );

  if (!refreshToken) {
    return next(req);
  }
  
  if(accessToken) {
    return next(addTokenHeader(req, accessToken));
  }
  else {
    return handle401Error(req, next, authService, refreshToken)
  }
}
function handle401Error(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
  refreshToken: string
): Observable<HttpEvent<unknown>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshTokenSSR(refreshToken).pipe(
      switchMap((newAccessToken: string) => {
        isRefreshing = false;
        refreshTokenSubject.next(newAccessToken);
        return next(addTokenHeader(req, newAccessToken));
      }),
      catchError(err => {
        isRefreshing = false;
        refreshTokenSubject.next(null);
        authService.logout();
        return throwError(() => err);
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
          return throwError(() => new Error("L'authentification a échoué"));
        }
      })
    );
  }
}

function addTokenHeader(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}
