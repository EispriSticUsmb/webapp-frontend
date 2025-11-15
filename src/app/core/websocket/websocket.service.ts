import { environment } from './../../../environments/environment';
import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { fromEvent, Observable } from 'rxjs';
import { Socket, io } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket!: Socket;
  private platformId = inject(PLATFORM_ID);

  constructor() {
    if (isPlatformBrowser(this.platformId)) { 
      this.socket = io(environment.wsUrl, {
        path: environment.wsPath + "/socket.io",
        transports: ["websocket"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      });
      this.socket.on("connect", () => {

      });
  
      this.socket.on("disconnect", (reason) => {

      });
    }
  }

  onConnect(): Observable<void> {
    return fromEvent(this.socket, 'connect') as Observable<void>;
  }

  onDisconnect(): Observable<void> {
    return fromEvent(this.socket, 'disconnect') as Observable<void>;
  }

  onError(): Observable<Error> {
    return fromEvent(this.socket, 'error') as Observable<Error>;
  }

  subscribeWsEvent<T>(WsEvent: string): Observable<T> {
    return fromEvent(this.socket, WsEvent) as Observable<T>;
  }

  emitSubscribeWsEvent(wsEvent: string) {
    this.socket.emit('subscribe', wsEvent);
  }

  emitUnsubscribeWsEvent(wsEvent: string) {
    this.socket.emit('unsubscribe', wsEvent);
  }
}
