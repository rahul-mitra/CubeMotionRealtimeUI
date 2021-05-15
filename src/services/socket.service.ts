import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

export const socketServerURL: string = "https://api.cube.rahulmitra.dev"
// export const socketServerURL: string = "http://140.238.226.73:3000"
// export const socketServerURL: string = "http://localhost:3000";
// export const socketServerURL: string = "https://rh-chat-server.herokuapp.com";
const options = {
  reconnectionDelayMax: 10000,
  reconnectionAttempts: 5,
  transports: ["websocket"],
  upgrade: false,
  reconnection: true,
}
@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socketClient!: Socket;
  constructor() {
    this.initSocket();
  }
  public  initSocket(){
    this.socketClient =  io(socketServerURL, options);
    console.log("socket initialized");
  }
  public onConnected(): Observable<string> {
    var observer = new Observable<string>((observer) => {
      this.socketClient.on("connect", () => {
        observer.next("Connected to server")
      });
    });
    return observer;
  }
  public disconnect() {
    this.socketClient.disconnect();
  }
  public testServer() {
    // console.log("Connection status ",this.socketClient.connected);
    this.socketClient.emit("testServer", "testing 123");
  }


  public onServerMessages(): Observable<string> {
    return new Observable<string>((observer) => {
      this.socketClient.on("serverMessage", (message: string) => {
        observer.next(message)
      });
    });
  }

  public emitAxis(x:number,y:number,z:number)
  {
    this.socketClient.emit("emitAxis",{x:x,y:y,z:z})
  }

  public onEmitAxis(): Observable<{x:number,y:number,z:number}> {
    return new Observable<{x:number,y:number,z:number}>((observer) => {
      this.socketClient.on("emitAxis", (axis:{x:number,y:number,z:number}) => {
        observer.next(axis)
      });
    });
  }

  public emitColor(colorCode:string)
  {
    console.log("emitting color",colorCode);
    this.socketClient.emit("emitColor",colorCode)
  }

  public onEmitColor(): Observable<string> {
    return new Observable<string>((observer) => {
      this.socketClient.on("emitColor", (colorCode:string) => {
        observer.next(colorCode)
      });
    });
  }


}
