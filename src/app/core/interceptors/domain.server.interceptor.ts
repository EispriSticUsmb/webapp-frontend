import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export function domainInterceptorServer(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  let envApiUrl = process.env['API_URL_SSR'] || environment.apiUrl;
  if(envApiUrl.endsWith('/')){
    envApiUrl = envApiUrl.substring(0, envApiUrl.length - 1);
  }
  if (!req.url.startsWith(envApiUrl)) {
    let reqUrl = req.url;
    if(reqUrl.startsWith('/')){
      reqUrl = reqUrl.substring(1);
    }

    const updatedReq = req.clone({
      url: envApiUrl + "/" + reqUrl
  });
  return next(updatedReq);
  }

  return next(req);
}
