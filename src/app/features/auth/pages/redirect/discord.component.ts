import { Component, OnInit } from "@angular/core";

@Component({
  selector: 'app-discord-redirect',
  template: ''
})
export class DiscordRedirectComponent implements OnInit {
    ngOnInit(): void {
      window.location.href = 'https://discord.com/invite/CD6q83XWS9';
    }
}