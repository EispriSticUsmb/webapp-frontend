import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Notification } from '../../features/user/user.model';
import { Team, TeamInvitation } from '../../features/team/team.modele';
import { EventParticipant } from '../../features/event/event/event.model';

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private http = inject(HttpClient);

  getTeam(id: string): Observable<Team> {
    return this.http.get<Team>('teams/'+id);
  }

  deleteTeamMember(teamId: string, userId: string): Observable<Team> {
    return this.http.delete<Team>(`teams/${teamId}/members/${userId}`);
  }

  deleteTeamInvitation(invId: string): Observable<Notification> {
    return this.http.delete<Notification>(`invitations/${invId}`);
  }

  deleteTeam(teamId: string) {
    return this.http.delete<Team>('teams/'+teamId);
  }

  renameTeam(teamId: string, name: string): Observable<Team> {
    return this.http.put<Team>(`teams/${teamId}/name`, { name });
  }

  inviteTeamMember(teamId:string, identifier: string): Observable<TeamInvitation> {
    return this.http.post<TeamInvitation>(`teams/${teamId}/invitations`,{ identifier })
  }

  RespondInvByTeam(teamId : string, userId: string, answer: boolean) : Observable<EventParticipant | undefined> {
    return this.http.post<EventParticipant | undefined>(`teams/${teamId}/invitations/${userId}/respond`,{ answer })
  }
}
