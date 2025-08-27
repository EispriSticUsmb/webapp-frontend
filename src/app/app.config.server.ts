import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { domainInterceptorServer } from './core/interceptors/domain.server.interceptor';
import { authInterceptorServer } from './core/interceptors/auth.server.interceptor';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    provideHttpClient(withFetch(),withInterceptors([domainInterceptorServer,authInterceptorServer]))
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
