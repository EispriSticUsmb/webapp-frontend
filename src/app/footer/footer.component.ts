import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  year: number = (new Date()).getFullYear();

  DiscordLogo: String = '/assets/logo_discord.png';
  InstaLogo: String = '/assets/logo_instagram.png';

  constructor() {
  }
}
