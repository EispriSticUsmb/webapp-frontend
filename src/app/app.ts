import localeFr from '@angular/common/locales/fr';
import { Component, inject, LOCALE_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { AuthService } from './core/auth/auth.service';
import { registerLocaleData } from '@angular/common';
import { FooterComponent } from "./footer/footer.component";
import { WebsocketService } from './core/websocket/websocket.service';
registerLocaleData(localeFr, 'fr');
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
  providers: [{ provide: LOCALE_ID, useValue: 'fr-FR' }],
})

export class App {
  authService = inject(AuthService);
  websocketService = inject(WebsocketService);

  constructor() {
    this.authService.loadUser();
  }
}
