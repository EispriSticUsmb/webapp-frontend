import { inject, Injectable } from '@angular/core';
import { Event } from '../../features/event/event/event.model';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private readonly _futureEvents$ = new BehaviorSubject<Event[] | null>(null);
  private readonly _allEvents$ = new BehaviorSubject<Event[] | null>(null);

  private http = inject(HttpClient);

  constructor() {
    this.loadAllEvents();
  }

  get futureEvents$(): Observable<Event[] | null> {
    return this._futureEvents$.asObservable();
  }
    get allEvents$(): Observable<Event[] | null> {
    return this._allEvents$.asObservable();
  }

  loadAllEvents() {
    this.http.get<Event[]>("events").pipe(
      tap(events => {
        this._allEvents$.next(events);
        console.log("coucou +"+events);
      }),
      catchError((err) => {
        return of(null);
      })
    ).subscribe()
  }
}
