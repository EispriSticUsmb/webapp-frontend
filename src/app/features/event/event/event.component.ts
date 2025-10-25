import { AuthService } from './../../../core/auth/auth.service';
import { Component, inject, Input, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EventService } from '../../../core/event/event.service';
import { Subscription } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { NotFoundComponent } from "../../not-found/not-found.component";
import { Event } from '../event/event.model';
import { CommonModule } from '@angular/common';
import { PopupComponent } from "../../popup/popup.component";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { SpinnerComponent } from "../../spinner/spinner.component";
import { User } from '../../user/user.model';

@Component({
  selector: 'app-event.component',
  imports: [NotFoundComponent, CommonModule, RouterLink, PopupComponent, ReactiveFormsModule, SpinnerComponent],
  templateUrl: './event.component.html',
  styleUrl: './event.component.css'
})
export class EventComponent implements OnInit,OnDestroy{
  private route = inject(ActivatedRoute);
  private eventService = inject(EventService);
  private router = inject(Router);
  private auth = inject(AuthService);

  @Input() event = signal<Event | undefined>(undefined) ;
  eventId!: string;
  sub!: Subscription;
  status = signal<string>('loading');
  imageUrl!: string;
  textButton = signal<String>('');
  isDisabled = signal<Boolean>(true);
  popup = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  createTeamButtonInProgress = signal<boolean>(false);
  user = signal<User | null | undefined>(undefined);
  userId = signal<string | null>(null);
  userSubscription!: Subscription;
  mainButtonIsLoading = signal<boolean>(false);

  form = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.maxLength(64)])
  });

  get name() {
    return this.form.get('name')!;
  }
  ngOnInit(): void {
    this.userSubscription = this.auth.user$.subscribe(user => {
      this.user.set(user);
      if(user) {
        this.userId.set(user.id!);
      }
      else {
        this.userId.set(null);
      }
      if(this.event()) {
        this.textButton.set(this.buttonEventText(this.event()!))
      } 
      this.isDisabled.set(this.ButtonDisableState());
    });
    this.mainButtonIsLoading.set(false);
    this.createTeamButtonInProgress.set(false);
    this.errorMessage.set(null);
    this.popup.set(false);
    this.eventId = this.route.snapshot.paramMap.get('id')!;
    this.imageUrl = environment.apiUrl+'/events/'+this.eventId+'/eventImage';
    this.sub = this.eventService.findEventById(this.eventId).subscribe(res => {
      this.event.set(res.event);
      if(this.event() )this.event.update(e => ({ ...e, externalLink: 'https://google.com' }) as Event);
      this.status.set(res.status);
      this.textButton.set(this.buttonEventText(res.event as Event))
      this.isDisabled.set(this.ButtonDisableState());
    });
  }

  ButtonDisableState(): boolean {
    if(!this.eventService.AreInscriptionAllowed(this.event()!))
      return true;
    if(!this.userId()) return true;
    return false;
  }

  buttonEventText(event: Event): string {
    const now = new Date();
    if(!this.userId())
      return "Connectez-vous pour vous inscrire !";
    if(this.eventService.isUserInEvent(event.id)){
      if(this.event()?.allowTeams)
       return "Mon équipe";
      return "Se désinscrire";
    }
    if(event?.registrationStart && now < event.registrationStart)
      return "Inscription à venir";
    if(event?.registrationEnd && now > event.registrationEnd)
      return "Inscription terminée";
    if(event?.maxParticipants && event.currentParticipants && event.maxParticipants<event.currentParticipants)
      return "Événement complet";
    if(event?.allowTeams) {
      return "Créer une équipe";
    }
    return "Rejoindre l'événement";
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.userSubscription.unsubscribe();
  }

  closePopUp(): void {
    this.popup.set(false);
  }

  createTeam(): void {
    if(this.name.invalid) return;
    this.createTeamButtonInProgress.set(true);
    this.eventService.createTeam(this.name.value!, this.event()!).subscribe(
      {
        next: (team) => {
          this.createTeamButtonInProgress.set(false);
          this.router.navigate(['/team', team.id]);
          this.errorMessage.set(null);
        },

        error: (err : HttpErrorResponse) => {
          if(err.status){
            this.errorMessage.set(err.error?.message || 'Oups ! Impossible de se connecter pour le moment')
          } else {
            this.errorMessage.set("Oups ! Impossible de se connecter pour le moment")
          }
          this.createTeamButtonInProgress.set(false);
          this.popup.set(false);
        }
      }
    );
  }

  buttonEvent(): void {
    const event = this.event();
    if(event) {
      if(this.eventService.isUserInEvent(event.id)) {
        if(!event.allowTeams) {
          this.mainButtonIsLoading.set(true);
          this.eventService.leaveEvent(this.eventId, this.userId()!).subscribe({
                next: () => {
                  this.mainButtonIsLoading.set(false);
                  this.errorMessage.set(null);
                },
                error: (err : HttpErrorResponse) => {
                  this.mainButtonIsLoading.set(false);
                  if(err.status){
                    this.errorMessage.set(err.error?.message || 'Oups ! Impossible de se connecter pour le moment')
                  } else {
                    this.errorMessage.set("Oups ! Impossible de se connecter pour le moment")
                  }
                  this.createTeamButtonInProgress.set(false);
                }
            });
        } else {
          const teamId = this.user()?.participations?.find(e => e.eventId===this.eventId)?.teamId;
          if(teamId) {
            this.router.navigate(['/team/'+teamId]);
          }
        }
      } else {
        if(this.eventService.AreInscriptionAllowed(event)) {
          if(event.allowTeams) {
            this.popup.set(true);
            return;
          }
          else {
            this.mainButtonIsLoading.set(true);
            this.eventService.joinEvent(this.eventId, this.userId()!).subscribe({
              next: () => {
                this.mainButtonIsLoading.set(false);
                this.errorMessage.set(null);
              },
              error: (err : HttpErrorResponse) => {
                this.mainButtonIsLoading.set(false);
                if(err.status){
                  this.errorMessage.set(err.error?.message || 'Oups ! Impossible de se connecter pour le moment')
                } else {
                  this.errorMessage.set("Oups ! Impossible de se connecter pour le moment")
                }
                this.createTeamButtonInProgress.set(false);
              }
            });
          }
        }
      }
    }
  }
}
