
import { SocketService } from './../services/socket.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import * as THREE from 'three';
import { isGeneratedFile } from '@angular/compiler/src/aot/util';
import { MatSliderChange } from '@angular/material/slider';

export class ColorCodesWTime {
  colorCode: string;
  time: Date
  constructor(color: string) {
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

  public subs: Array<Subscription> = new Array<Subscription>();
  camera!: THREE.PerspectiveCamera;
  scene!: THREE.Scene;
  renderer!: THREE.WebGLRenderer;
  geometry!: THREE.BoxGeometry;
  material!: THREE.MeshNormalMaterial;
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
    this.subs.push(this.socketService.onEmitAxis().subscribe(axis => {
      this.mesh.rotation.x = axis.x;
      this.mesh.rotation.y = axis.y;
      this.mesh.rotation.z = axis.z;
      this.cstX = axis.x;
      this.cstY = axis.y;
      this.cstZ = axis.z;
      this.setRenderer();
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
      this.socketService.emitAxis(this.cstX, this.cstY, this.cstZ);
      this.setRenderer();
    }
  }
  changeY(y: MatSliderChange) {

    if (y.value) {
      this.mesh.rotation.y = y.value;
      this.cstY = y.value;
      this.socketService.emitAxis(this.cstX, this.cstY, this.cstZ);
      this.setRenderer();
    }
  }
  changeZ(z: MatSliderChange) {

    if (z.value) {
      this.mesh.rotation.z = z.value;
      this.cstZ = z.value;
      this.socketService.emitAxis(this.cstX, this.cstY, this.cstZ);
      this.setRenderer();
    }
  }

  setRenderer() {
    this.renderer.render(this.scene, this.camera)
  }

  public test() {
    this.socketService.testServer();
    // this.randomnum=this.randomnum+1;
    // this.mesh.rotation.x = this.randomnum / 10;
    // this.mesh.rotation.y = this.randomnum / 20;
    // this.mesh.rotation.z = this.randomnum / 30;
    // console.log(this.mesh.rotation.x);
    // this.renderer.render(this.scene, this.camera);
  }

  public threeInit() {
    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10);
    this.camera.position.z = 1;

    this.scene = new THREE.Scene();

    this.geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    this.material = new THREE.MeshNormalMaterial();

    this.mesh = new THREE.Mesh(this.geometry, this.material);
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

  changeColor(colorCode?: string, callEmitter: boolean = false) {
    if (colorCode) {
      this.mesh.material = new THREE.MeshBasicMaterial({ color: colorCode });
      this.colorsUsed.push(new ColorCodesWTime(colorCode));
      if (callEmitter)
        this.socketService.emitColor(colorCode);
    }
    else {
      let color = this.randomColor();
      this.socketService.emitColor(color);
      this.mesh.material = new THREE.MeshBasicMaterial({ color: color })
      this.colorsUsed.push(new ColorCodesWTime(color));
    }
    this.renderer.render(this.scene, this.camera);
  }

  randomColor() {
    return "#" + Math.floor(Math.random() * 16777215).toString(16)
  }
}
