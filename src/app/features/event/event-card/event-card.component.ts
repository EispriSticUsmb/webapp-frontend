import { Component, Input, OnInit } from '@angular/core';
import { Event } from '../event/event.model';
import { environment } from '../../../../environments/environment';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'event-card',
  imports: [CommonModule, RouterLink],
  templateUrl: './event-card.component.html',
  styleUrl: './event-card.component.css'
})
export class EventCardComponent implements OnInit {

  @Input() event! : Event;
  imageUrl!: string;

  ngOnInit(): void {
    this.imageUrl = environment.apiUrl+'/events/'+this.event.id+'/eventImage'
  }
}
