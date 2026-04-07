import { Component, inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Event } from '../event/event.model';
import { environment } from '../../../../environments/environment';
import { AsyncPipe, CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'event-card',
  standalone: true,
  imports: [CommonModule, RouterLink, AsyncPipe],
  templateUrl: './event-card.component.html',
  styleUrl: './event-card.component.css'
})
export class EventCardComponent implements OnInit, OnChanges {
  private authservice = inject(AuthService);
  user$ = this.authservice.user$;

  @Input() event!: Event;
  @Input() previewImage?: string | null;
  
  displayImageUrl!: string;

  ngOnInit(): void {
    this.updateImage();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.updateImage();
  }

  private updateImage(): void {
    if (this.previewImage) {
      this.displayImageUrl = this.previewImage;
    } else if (this.event?.id) {
      this.displayImageUrl = `${environment.apiUrl}/events/${this.event.id}/eventImage`;
    } else {
      this.displayImageUrl = '/logo.png';
    }
  }
}