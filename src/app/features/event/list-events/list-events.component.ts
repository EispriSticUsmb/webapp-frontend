import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { EventService } from '../../../core/event/event.service';
import { EventCardComponent } from "../event-card/event-card.component";
import { Subscription } from 'rxjs';
import { Event } from '../event/event.model';

@Component({
  selector: 'app-list-events.component',
  imports: [EventCardComponent],
  templateUrl: './list-events.component.html',
  styleUrl: './list-events.component.css'
})
export class ListEventsComponent implements OnInit,OnDestroy {
  private readonly eventService = inject(EventService);
  
  eventsub!: Subscription;
  futureEvent = signal<Event[]>([]);
  oldEvent = signal<Event[]>([]);


  ngOnInit(): void {
    this.eventsub = this.eventService.allEvents$.subscribe(
      events => {
        this.assignEvent(events ?? []);
      }
    )
  }

  ngOnDestroy(): void {
    this.eventsub.unsubscribe();
  }

  assignEvent(events: Event[]): void {
    const date = new Date();
    let futureEvent: Event[] = [];
    let oldEvent: Event[] = [];
    events.forEach( event => {
      if(event.startDate && new Date(event.startDate) > date) {
        futureEvent.push(event);
      }
      if(event.startDate && new Date(event.startDate) < date) {
        oldEvent.push(event);
      }
    })
    this.futureEvent.set(futureEvent);
    this.oldEvent.set(oldEvent);
  }
}
