import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Event } from '../event/event.model';
import { environment } from '../../../../environments/environment';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'event-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './event-card.component.html',
  styleUrl: './event-card.component.css'
})
export class EventCardComponent implements OnInit, OnChanges {

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