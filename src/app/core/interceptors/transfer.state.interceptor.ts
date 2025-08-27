import { isPlatformBrowser, isPlatformServer } from "@angular/common";
import { HttpEvent, HttpHandlerFn, HttpRequest, HttpResponse } from "@angular/common/http";
import { inject, makeStateKey, PLATFORM_ID, StateKey, TransferState } from "@angular/core";
import { Observable, of, tap } from "rxjs";

export function transferStateInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
    if (req.method !== 'GET') {
      return next(req);
    }

    const transferState = inject(TransferState);
    const platformId = inject(PLATFORM_ID);
    const key: StateKey<string> = makeStateKey<string>(
      'transfer-' + req.urlWithParams
    );

    if (isPlatformBrowser(platformId)) {
      if (transferState.hasKey(key)) {
        const storedResponse = transferState.get<any>(key, null);
        transferState.remove(key);
        return of(new HttpResponse({ body: storedResponse, status: 200 }));
      }
    }

    return next(req).pipe(
      tap((event) => {
        if (
          isPlatformServer(platformId) &&
          event instanceof HttpResponse
        ) {
          transferState.set<any>(key, event.body);
        }
      })
    );
}