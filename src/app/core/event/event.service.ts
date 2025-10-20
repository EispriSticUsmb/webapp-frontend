import { inject, Injectable } from '@angular/core';
import { Event } from '../../features/event/event/event.model';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, map, Observable, of, tap } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Team } from '../../features/team/team.modele';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private readonly _allEvents$ = new BehaviorSubject<Event[] | null>(null);

  private http = inject(HttpClient);
  private auth = inject(AuthService);

  constructor() {
    this.loadAllEvents();
  }

  get allEvents$(): Observable<Event[] | null> {
    return this._allEvents$.asObservable();
  }

  loadAllEvents() {
    this.http.get<Event[]>("events").pipe(
      tap(events => {
        this._allEvents$.next(events);
      }),
      catchError((err) => {
        return of(null);
      })
    ).subscribe()
  }

  updateEvent(eventId: string) {
    this.http.get<Event>("events/"+eventId).pipe(
      tap(
        updatedEvent => {
          const events = this._allEvents$.value;

          if (!events) {
            return;
          }

          const newEvents = events.map(event =>
            event.id === updatedEvent.id ? updatedEvent : event
          );

          this._allEvents$.next(newEvents);
        }
      )
    ).subscribe()
  }

  findEventById(eventId: string): Observable<{ status: string; event?: Event }> {
    return this.allEvents$.pipe(
      map(events => {
        if (events === null) {
          return { status: 'loading' };
        }

        const found = events.find(event => event.id === eventId);
        if (!found) {
          return { status: 'not-found' };
        }

        return { status: 'found', event: found };
      })
    );
  }

  AreInscriptionOpen(event: Event): boolean {
    const now = new Date();
    if(event?.registrationStart && now < event.registrationStart)
      return false;
    if(event?.registrationEnd && now > event.registrationEnd)
      return false;
    return true;
  }

  IsEventFull(event: Event): boolean {
    return !!event?.maxParticipants && !!event?.currentParticipants && (event?.maxParticipants<=event?.currentParticipants);
  }

  AreInscriptionAllowed(event: Event): boolean {
    return !this.IsEventFull(event) &&
      this.AreInscriptionOpen(event);
  }

  isUserInEvent(eventId: string): boolean {
    const user = this.auth.userCurrentValue;
    return !!user?.participations?.some(u => u.eventId === eventId);
  }

  createTeam(teamName: string, event: Event): Observable<Team> {
    return this.http.post<Team>(`events/${event.id}/teams`, {name: teamName}).pipe(
      tap( team => {
        event?.teams?.push({
          id: team.id,
          createdAt: team.createdAt,
          eventId: team.eventId,
          leaderId: team.leaderId,
          name: team.name,
          members: [{
            createdAt: new Date(), userId: this.auth._user$.value!.id,
            id: '',
            user: this.auth.userCurrentValue!,
            event,
            eventId: ''
          }],
          invitations: [],
          event,
          leader: this.auth.userCurrentValue!
        });
        this.updateEvent(event.id);
        this.auth.loadUser();
      })
    );
  }

  joinEvent(eventId: string, userId: string): Observable<void> {
    return this.http.post<void>(`events/${eventId}/participants`, { userId }).pipe(
      tap(
        () => {
          const user = this.auth._user$.value!;
          user.participations?.push(
            {
              createdAt: new Date(),
              eventId,
              id: '',
              user: user,
              userId: user.id,
              event: this._allEvents$.value!.find(obj => obj.id === eventId)!
            }
          )
          this.auth._user$.next(user);
          this.updateEvent(eventId);
          this.auth.loadUser();
        }
      ),
    )
  }

  leaveEvent(eventId: string, userId: string): Observable<void> {
    return this.http.delete<void>(`events/${eventId}/participants`, { body :{ userId }}).pipe(
      tap(
        () => {
          const user = this.auth._user$.value!;
          user.participations = user.participations?.filter(
            (p) => p.eventId !==eventId
          );
          this.auth._user$.next(user);
          this.updateEvent(eventId);
          this.auth.loadUser();
        }
      ),
    )
  }

  updateEventList(eventId: string, newEvent: Event) {
      const events = this._allEvents$.value;

      if (!events) {
        return;
      }

      const newEvents = events.map(event =>
        event.id === newEvent.id ? newEvent : event
      );
      this._allEvents$.next(newEvents);
  }
}
