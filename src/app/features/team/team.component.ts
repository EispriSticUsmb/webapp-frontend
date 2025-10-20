import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NotFoundComponent } from "../not-found/not-found.component";
import { SpinnerComponent } from "../spinner/spinner.component";
import { TeamService } from '../../core/event/team.service';
import { User } from '../user/user.model';
import { UserService } from '../../core/user/user.service';
import { Team } from './team.modele';
import { AuthService } from '../../core/auth/auth.service';
import { Subscription } from 'rxjs';
import { PopupComponent } from "../popup/popup.component";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { EventService } from '../../core/event/event.service';
import { Event } from '../event/event/event.model';

@Component({
  selector: 'app-team',
  imports: [NotFoundComponent, SpinnerComponent, PopupComponent, ReactiveFormsModule],
  templateUrl: './team.component.html',
  styleUrl: './team.component.css'
})
export class TeamComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);  
  private teamService = inject(TeamService);
  private userService = inject(UserService);
  private eventService = inject(EventService);
  private auth = inject(AuthService);
  private router = inject(Router);

  teamId!: string;
  team = signal<Team | undefined>(undefined);
  status = signal<string>('loading');
  members = signal<User[]>([]);
  inviteds = signal<User[]>([]);
  activeTab = signal<'membres' | 'invitations'>('membres');
  errorMessage = signal<string | null>(null);
  userSub!: Subscription;
  user = signal<User | null | undefined>(null);
  eventSub: Subscription | undefined;
  event :Event | undefined;
  popup = signal<boolean>(false);
  resInv = signal<boolean>(false);
  invitedUser = computed(() => {
    return this.inviteds().find(u => u.id === this.user()?.id) ?? null;
  });
  isTeamMember = computed(() => {
    return this.members().findIndex( member => member.id===this.user()?.id) !== -1
  } )

  form = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.maxLength(64)])
  });

  get name() {
    return this.form.get('name')!;
  }
  ngOnInit(): void {
    this.userSub = this.auth.user$.subscribe(
      user => this.user.set(user ? { ...user } : null)
    ) 
    this.errorMessage.set(null);
    this.status.set('loading');
    this.teamId = this.route.snapshot.paramMap.get('id')!;
    this.teamService.getTeam(this.teamId).subscribe( {
      next: team => {
        this.eventSub = this.eventService.findEventById(team.eventId).subscribe(content => {
          this.event = content.event;
        });
        this.getMembers(team);
        this.getInvitations(team);
        this.team.set(team);
        this.status.set('found');
      },
      error: _ => {
        this.status.set('not-found');
      }
    } );
  }

  getMembers(team: Team): void {
    team.members?.forEach(
      member => {
        this.userService.getUser(member.userId).subscribe(
          user => { 
            this.members.update(users => [...users, user])
           }
        )
      }
    )
  }

  getInvitations(team: Team): void {
    team.invitations?.forEach(
      invited => {
        this.userService.getUser(invited.invitedId).subscribe(
          user => { 
            this.inviteds.update(users => [...users, user]);
           }
        )
      }
    )
  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
    this.eventSub?.unsubscribe();
  }

  SwitchTab(tab: 'membres' | 'invitations') {
    if(tab==='membres') {
      this.activeTab.set('invitations');
    }
    else {
      this.activeTab.set('membres');
    }
  }

  deleteTeamMember(userId: string) {
    this.teamService.deleteTeamMember(this.team()!.id, userId).subscribe({
      next: (team) => {
        this.team.set(team);
        this.members.set(this.members().filter(member => member.id!==userId))
        this.errorMessage.set(null);
      },
      error: (err : HttpErrorResponse) => {
        if(err.status){
          this.errorMessage.set(err.error?.message || 'Oups ! Impossible de se connecter pour le moment')
        } else {
          this.errorMessage.set("Oups ! Impossible de se connecter pour le moment")
        }
      },
    });
  }

  deleteTeamInv(userId: string) {
    let invId = null;
    this.team()?.invitations?.forEach(element => {
      if (element.invitedId===userId) {
        invId = element.id
      }
    });
    if(invId) {
      this.teamService.deleteTeamInvitation(invId).subscribe({
        next: (team) => {
          this.inviteds.set(this.inviteds().filter(member => member.id !==userId));
          this.errorMessage.set(null);
        },
        error: (err : HttpErrorResponse) => {
          if(err.status){
            this.errorMessage.set(err.error?.message || 'Oups ! Impossible de se connecter pour le moment')
          } else {
            this.errorMessage.set("Oups ! Impossible de se connecter pour le moment")
          }
        },
      });
    }
  }

  deleteTeam() {
    this.teamService.deleteTeam(this.teamId).subscribe({
      next: () => {
        const user = this.user();
        if(user?.participations) {
          user.participations = user.participations.filter(part => part.teamId !== this.teamId);

          this.auth.updateUser(user);
        }
        this.event!.teams = this.event?.teams?.filter(t => t.id!==this.teamId);
        this.eventService.updateEventList(this.event!.id, this.event!);
        this.router.navigate(['/']);
        },
      error: (err : HttpErrorResponse) => { 
        if(err.status){
          this.errorMessage.set(err.error?.message || 'Oups ! Impossible de se connecter pour le moment')
        } else {
          this.errorMessage.set("Oups ! Impossible de se connecter pour le moment")
        }
      }
    })
  }

  closePopUp() {
    this.popup.set(false);
  }

  renameTeam() {
    const name: string = this.name.value!;
    this.teamService.renameTeam(this.teamId, name).subscribe({
      next: (Newteam) => { 
        this.team.set(Newteam);
        this.errorMessage.set(null);
        this.popup.set(false);
      },
      error: (err : HttpErrorResponse) => { 
        if(err.status){
          this.errorMessage.set(err.error?.message || 'Oups ! Impossible de se connecter pour le moment')
        } else {
          this.errorMessage.set("Oups ! Impossible de se connecter pour le moment")
        }
      }
    })
  }

  openPopup() {
    this.popup.set(true);
  }

  invitClick(identifier: string) {
    this.teamService.inviteTeamMember(this.teamId, identifier.trim()).subscribe({
      next: (newInvitation) => {
        this.errorMessage.set(null);
        this.team.update(team => {
          if (!team) return team;

          return {
            ...team,
            invitations: [...(team.invitations ?? []), newInvitation],
          };
        });
        this.userService.getUser(newInvitation.invitedId).subscribe(
          user => { 
            this.inviteds.update(users => [...users, user]);
           }
        )
      },
      error: (err : HttpErrorResponse) => {
        if(err.status){
          this.errorMessage.set(err.error?.message || 'Oups ! Impossible de se connecter pour le moment')
        } else {
          this.errorMessage.set("Oups ! Impossible de se connecter pour le moment")
        }
      },
    })
  }

  acceptInv() {
    if(this.resInv()) return;
    const user = this.user()!;
    this.resInv.set(true);
    this.teamService.RespondInvByTeam(this.teamId, user.id, true).subscribe({
      next: (NewEventParticipant) => {
        if(NewEventParticipant) {
          this.team.update(team => {
            if (!team) return team;
  
            return {
              ...team,
              members: [...(team.members ?? []), NewEventParticipant],
            };
          });
          this.members.update(users => [...users, user]);
          this.inviteds.set(this.inviteds().filter(member => member.id !==user.id));
        }
        this.errorMessage.set(null);
        this.resInv.set(false);
      },
      error: (err : HttpErrorResponse) => {
          if(err.status){
            this.errorMessage.set(err.error?.message || 'Oups ! Impossible de se connecter pour le moment')
          } else {
            this.errorMessage.set("Oups ! Impossible de se connecter pour le moment")
          }
          this.resInv.set(false);
        }
    })
  }

  declineInv() {
    if(this.resInv()) return;
    const userId = this.user()!.id;
    this.resInv.set(true);
    this.teamService.RespondInvByTeam(this.teamId, userId, false).subscribe({
      next: () => {
        this.inviteds.set(this.inviteds().filter(member => member.id !==userId));
        this.errorMessage.set(null);
        this.resInv.set(false);
      },
      error: (err : HttpErrorResponse) => {
          if(err.status){
            this.errorMessage.set(err.error?.message || 'Oups ! Impossible de se connecter pour le moment')
          } else {
            this.errorMessage.set("Oups ! Impossible de se connecter pour le moment")
          }
          this.resInv.set(false);
        }
    })
  }
}
