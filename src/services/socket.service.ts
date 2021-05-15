import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';


// export const socketServerURL: string = "http://140.238.226.73:3000"
export const socketServerURL: string = "http://localhost:5000";
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
  constructor(private _snackBar:MatSnackBar) {
    this.initSocket();
  }
  public initSocket() {
    this.socketClient = io(socketServerURL, options);
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

  public emitAxisX(x: number, roomID: string) {
    if (roomID)
      this.socketClient.emit("emitAxisX", x, roomID)
  }

  public onEmitAxisX(): Observable<number> {
    return new Observable<number>((observer) => {
      this.socketClient.on("emitAxisX", (x: number) => {
        observer.next(x)
      });
    });
  }

  public emitAxisY(y: number, roomID: string) {
    if (roomID)
      this.socketClient.emit("emitAxisY", y, roomID)
  }

  public onEmitAxisY(): Observable<number> {
    return new Observable<number>((observer) => {
      this.socketClient.on("emitAxisY", (y: number) => {
        observer.next(y)
      });
    });
  }

  public emitAxisZ(z: number, roomID: string) {
    if (roomID)
      this.socketClient.emit("emitAxisZ", z, roomID)
  }

  public onEmitAxisZ(): Observable<number> {
    return new Observable<number>((observer) => {
      this.socketClient.on("emitAxisZ", (z: number) => {
        observer.next(z)
      });
    });
  }
  public onServerMessage(): Observable<string> {
    return new Observable<string>((observer) => {
      this.socketClient.on("serverMessage", (message: string) => {
        observer.next(message)
      });
    });
  }

  public emitColor(colorCode: string, roomID: string) {
    console.log("emitting color ", colorCode);
    console.log("emitting in room ", roomID);
    if (roomID)
      this.socketClient.emit("emitColor", colorCode, roomID)
  }

  public onEmitColor(): Observable<string> {
    return new Observable<string>((observer) => {
      this.socketClient.on("emitColor", (colorCode: string) => {
        observer.next(colorCode)
      });
    });
  }

  public JoinRoom(roomID: string) {
    this.socketClient.emit("joinRoom", roomID)
  }

  openSnackBar(message: string, action: string = "Ok", duration: number = 3000,
  horizontalPosition: MatSnackBarHorizontalPosition = 'right',
  verticalPosition: MatSnackBarVerticalPosition = 'bottom') {
  this._snackBar.open(message, action, {
    duration: duration,
    horizontalPosition: horizontalPosition,
    verticalPosition: verticalPosition,
  });
}

}
