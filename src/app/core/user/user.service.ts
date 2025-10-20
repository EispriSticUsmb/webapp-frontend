import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PartialUser, User, UserType } from '../../features/user/user.model';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private users: Record<string, BehaviorSubject<User | null | undefined>> = {};

  updateUser(userId: string, user: User | null) {
    if(this.users[userId]) {
      this.users[userId].next(user);
    } else {
      this.users[userId] = new BehaviorSubject<User | null | undefined>(user);
    }
  }

  getUser$(userId: string): Observable<User | null | undefined> {
    if(!this.users[userId])
      this.users[userId] = new BehaviorSubject<User | null | undefined>(undefined);
    return this.users[userId].asObservable();
  }

  private default_pdp(role: UserType): string {
    const base_pdp_url = '/default_pdp/';
    switch(role) {
      case 'ETUDIANT': {
        return base_pdp_url + 'student.png';
      }
      case 'ENSEIGNANT': {
        return base_pdp_url + 'teacher.png';
      }
      case 'ANCIEN': {
        return base_pdp_url + 'former.png';
      }
      default: {
        return base_pdp_url + 'user.png';
      }
    }
  }

  getUser(userId : string): Observable<User> {
    return this.http.get<User>('users/'+userId).pipe(
        map(user => {
          if (!user.profileImage || user.profileImage.startsWith('/default_pdp/')){
            user.profileImage = this.default_pdp(user.userType);
          }
          else {
            if (isPlatformBrowser(this.platformId)) {
                let envApiUrl = environment.apiUrl;
                if(envApiUrl.endsWith('/')){
                envApiUrl = envApiUrl.substring(0, envApiUrl.length - 1);
                }
                user.profileImage = envApiUrl + '/users/' + user.id + '/profileImage';
            } else {
                let envApiUrl = process.env['API_URL_SSR'] || environment.apiUrl;
                if(envApiUrl.endsWith('/')){
                    envApiUrl = envApiUrl.substring(0, envApiUrl.length - 1);
                }
                user.profileImage = envApiUrl + '/users/' + user.id + '/profileImage';
            }
          }
          return user;
        })
    );
  }

  pathUser(userId: string, partialUser: PartialUser): Observable<User> {
    return this.http.patch<User>(`users/${userId}`, partialUser).pipe(
      map(user => {
        if (!user.profileImage || user.profileImage.startsWith('/default_pdp/')){
          user.profileImage = this.default_pdp(user.userType);
        }
        else {
          if (isPlatformBrowser(this.platformId)) {
              let envApiUrl = environment.apiUrl;
              if(envApiUrl.endsWith('/')){
              envApiUrl = envApiUrl.substring(0, envApiUrl.length - 1);
              }
              user.profileImage = envApiUrl + '/users/' + user.id + '/profileImage';
          } else {
              let envApiUrl = process.env['API_URL_SSR'] || environment.apiUrl;
              if(envApiUrl.endsWith('/')){
                  envApiUrl = envApiUrl.substring(0, envApiUrl.length - 1);
              }
              user.profileImage = envApiUrl + '/users/' + user.id + '/profileImage';
          }
        }
        return user;
      }),
      tap(user => {
        this.updateUser(userId, user);
      })
    )
  }

  updatePP(userId: string, file: File): Observable<void> {
    const formData = new FormData();
    formData.append('profileImage', file);

    return this.http.put<void>(`users/${userId}/profileImage`, formData);
  }
}
