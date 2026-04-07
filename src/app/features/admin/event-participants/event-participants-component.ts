import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { NotFoundComponent } from '../../not-found/not-found.component';
import { SpinnerComponent } from '../../spinner/spinner.component';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../../../core/event/event.service';
import { EventParticipant } from '../../../core/event/model/participant';
import { User, UserRole } from '../../user/user.model';
import { forkJoin, map, of, Subscription, switchMap } from 'rxjs';
import { UserService } from '../../../core/user/user.service';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-event-participants',
  imports: [NotFoundComponent, SpinnerComponent],
  templateUrl: './event-participants-component.html',
})
export class EventParticipantComponents implements OnInit, OnDestroy {
  status = signal<string>('loading');
  eventId!: string;
  participantsSub?: Subscription;
  userSub?: Subscription;

  private route = inject(ActivatedRoute);
  private eventService = inject(EventService);
  private userService = inject(UserService);
  private auth = inject(AuthService);
  private router = inject(Router);

  participants = signal<(EventParticipant & { user: User })[]>([]);;

  ngOnInit(): void {
    this.status.set('loading');
    this.eventId = this.route.snapshot.paramMap.get('id')!;

    this.userSub = this.auth.user$.subscribe(user => {
      if (user === undefined) return;

      if (!user || user.role !== UserRole.ADMIN) {
        this.router.navigate(['/']);
      }
    });
    
    this.participantsSub = this.eventService.getEventParticipants(this.eventId).pipe(
      switchMap((participants: EventParticipant[]) => {
        if (participants.length === 0) {
          return of([]);
        }

        const userRequests = participants.map(participant =>
          this.userService.getUser(participant.userId).pipe(
            map(user => ({ ...participant, user }))
          )
        );
        return forkJoin(userRequests);
      })
    ).subscribe({
      next: (enrichedParticipants) => {
        this.participants.set(enrichedParticipants);
        this.status.set('found');
      },
      error: (err) => {
        this.status.set('not-found');
      }
    })
  }

  ngOnDestroy(): void {
    this.participantsSub?.unsubscribe();
    this.userSub?.unsubscribe();
  }
}
