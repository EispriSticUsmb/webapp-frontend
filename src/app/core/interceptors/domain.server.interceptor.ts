import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export function domainInterceptorServer(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  if (!req.url.startsWith('http')) {
    let envApiUrl = process.env['API_URL_SSR'] || environment.apiUrl;
    let reqUrl = req.url;
    if(reqUrl.startsWith('/')){
      reqUrl = reqUrl.substring(1);
    }
    if(envApiUrl.endsWith('/')){
      envApiUrl = envApiUrl.substring(0, envApiUrl.length - 1);
    }
    const updatedReq = req.clone({
      url: envApiUrl + "/" + reqUrl
  });
  return next(updatedReq);
  }

  return next(req);
}
