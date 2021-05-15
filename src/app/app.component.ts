
import { SocketService } from './../services/socket.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import * as THREE from 'three';
import { isGeneratedFile } from '@angular/compiler/src/aot/util';
import { MatSliderChange } from '@angular/material/slider';
import { FormControl, FormGroup, Validators } from '@angular/forms';

export class ColorCodesWTime {
  colorCode: Array<string>;
  time: Date
  constructor(color: Array<string>) {
    this.colorCode = color;
    this.time = new Date;
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy, OnInit {
  title = 'cubeui';
  fg: FormGroup = new FormGroup({
    roomID: new FormControl(null, Validators.required)
  })
  public subs: Array<Subscription> = new Array<Subscription>();
  camera!: THREE.PerspectiveCamera;
  scene!: THREE.Scene;
  roomID!: string;
  renderer!: THREE.WebGLRenderer;
  geometry!: THREE.BoxGeometry;
  material: THREE.MeshBasicMaterial[] = [
    new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.8, side: THREE.DoubleSide }),
    new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.8, side: THREE.DoubleSide }),
    new THREE.MeshBasicMaterial({ color: 0x0000ff, transparent: true, opacity: 0.8, side: THREE.DoubleSide }),
    new THREE.MeshBasicMaterial({ color: 0xffff00, transparent: true, opacity: 0.8, side: THREE.DoubleSide }),
    new THREE.MeshBasicMaterial({ color: 0xff00ff, transparent: true, opacity: 0.8, side: THREE.DoubleSide }),
    new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.8, side: THREE.DoubleSide }),
  ];
  mesh!: THREE.Mesh;
  randomnum: number = 0;
  maxValue: number = 5;
  steps: number = 0.25;
  colorsUsed: Array<ColorCodesWTime> = new Array<ColorCodesWTime>();
  interaction: any;
  cstX: number = 0;
  cstY: number = 0;
  cstZ: number = 0;
  fpsElem!: Element;
  fpsThen: number = 0;
  constructor(private socketService: SocketService) {
    this.threeInit()
    this.subs.push(this.socketService.onServerMessages().subscribe(message => { console.log(message) }));
    this.subs.push(this.socketService.onConnected().subscribe(message => { console.log(message) }));
    this.subs.push(this.socketService.onEmitColor().subscribe(colorCode => {
      this.changeColor(colorCode);
      console.log("Recieved color code");
    }));
    this.subs.push(this.socketService.onEmitAxisX().subscribe(x => {
      this.mesh.rotation.x = x;
      this.cstX = x;
      this.setRenderer();
    }));
    this.subs.push(this.socketService.onEmitAxisY().subscribe(y => {
      this.mesh.rotation.y = y;
      this.cstY = y;
      this.setRenderer();
    }));
    this.subs.push(this.socketService.onEmitAxisZ().subscribe(z => {
      this.mesh.rotation.z = z;
      this.cstZ = z;
      this.setRenderer();
    }));
    this.subs.push(this.socketService.onServerMessage().subscribe(message => {
      this.socketService.openSnackBar(message, "Server", 5000);
    }));
  }


  ngOnInit(): void {
    let canvas: HTMLElement = document.getElementsByTagName("canvas")[0];
    canvas.addEventListener("click", () => { this.changeColor() });

  }
  ngOnDestroy(): void {
    this.subs.forEach(sub => sub.unsubscribe());
  }



  changeX(x: MatSliderChange) {
    if (x.value) {
      this.mesh.rotation.x = x.value;
      this.cstX = x.value;
      this.socketService.emitAxisX(this.cstX, this.roomID);
      this.setRenderer();
    }
  }
  changeY(y: MatSliderChange) {

    if (y.value) {
      this.mesh.rotation.y = y.value;
      this.cstY = y.value;
      this.socketService.emitAxisY(this.cstY, this.roomID);
      this.setRenderer();
    }
  }
  changeZ(z: MatSliderChange) {

    if (z.value) {
      this.mesh.rotation.z = z.value;
      this.cstZ = z.value;
      this.socketService.emitAxisZ(this.cstZ, this.roomID);
      this.setRenderer();
    }
  }

  setRenderer() {
    this.renderer.render(this.scene, this.camera)
  }



  public threeInit() {
    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10);
    this.camera.position.z = 1;

    this.scene = new THREE.Scene();

    this.geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    // this.material = new THREE.MeshNormalMaterial();
    this.mesh = new THREE.Mesh(this.geometry, this.material);

    // this.mesh = new THREE.Mesh( new THREE.BoxGeometry( 562, 562, 562, 1, 1, 1 ), this.material );
    this.scene.add(this.mesh);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    // this.renderer.setAnimationLoop(this.animation);
    this.renderer.render(this.scene, this.camera);
    document.body.appendChild(this.renderer.domElement);
  }
  animation = (time: number) => {
    if (this.mesh) {
      this.mesh.rotation.x = time / 10000;
      // this.mesh.rotation.y = time / 1000;
      // this.mesh.rotation.z = time / 500;
      this.renderer.render(this.scene, this.camera);
      // console.log(this.mesh.rotation.x);
    }
  }

  changeColor(colorCode?:Array<string>, callEmitter: boolean = false) {
    if(!this.roomID)
    {
      this.socketService.openSnackBar("Please join a room first")
      return;
    }
    if (colorCode) {
      this.material = [
        new THREE.MeshBasicMaterial({ color: colorCode[0], transparent: true, opacity: 0.8, side: THREE.DoubleSide }),
        new THREE.MeshBasicMaterial({ color: colorCode[1], transparent: true, opacity: 0.8, side: THREE.DoubleSide }),
        new THREE.MeshBasicMaterial({ color: colorCode[2], transparent: true, opacity: 0.8, side: THREE.DoubleSide }),
        new THREE.MeshBasicMaterial({ color: colorCode[3], transparent: true, opacity: 0.8, side: THREE.DoubleSide }),
        new THREE.MeshBasicMaterial({ color: colorCode[4], transparent: true, opacity: 0.8, side: THREE.DoubleSide }),
        new THREE.MeshBasicMaterial({ color: colorCode[5], transparent: true, opacity: 0.8, side: THREE.DoubleSide }),
      ];
      this.mesh.material = this.material;
      this.colorsUsed.push(new ColorCodesWTime(colorCode));
      if (callEmitter)
        this.socketService.emitColor(colorCode, this.roomID);
    }
    else {
      let colorarr: Array<string> = new Array<string>();
      for (let index = 0; index < 6; index++) {
        colorarr.push(this.randomColor());
      }
      this.colorsUsed.push(new ColorCodesWTime(colorarr));
      this.socketService.emitColor(colorarr, this.roomID);
      this.material = [
        new THREE.MeshBasicMaterial({ color: colorarr[0], transparent: true, opacity: 0.8, side: THREE.DoubleSide }),
        new THREE.MeshBasicMaterial({ color: colorarr[1], transparent: true, opacity: 0.8, side: THREE.DoubleSide }),
        new THREE.MeshBasicMaterial({ color: colorarr[2], transparent: true, opacity: 0.8, side: THREE.DoubleSide }),
        new THREE.MeshBasicMaterial({ color: colorarr[3], transparent: true, opacity: 0.8, side: THREE.DoubleSide }),
        new THREE.MeshBasicMaterial({ color: colorarr[4], transparent: true, opacity: 0.8, side: THREE.DoubleSide }),
        new THREE.MeshBasicMaterial({ color: colorarr[5], transparent: true, opacity: 0.8, side: THREE.DoubleSide }),
      ];
      this.mesh.material = this.material;
    }
    this.renderer.render(this.scene, this.camera);
  }

  randomColor() {
    let color = "#" + Math.floor(Math.random() * 16777215).toString(16)
    color = color.padEnd(7, "1");

    return color;
  }
  joinRoom() {
    console.log()
    let roomid = this.fg.controls.roomID.value;
    console.log(roomid);
    if (roomid) {
      this.roomID = roomid;
      this.socketService.JoinRoom(roomid);
    }
    else
      this.socketService.openSnackBar("Please enter a room name first")
  }
}
