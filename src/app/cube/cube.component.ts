import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import * as THREE from "three";
import {Color, Material, MathUtils, Mesh, MeshStandardMaterial, Object3D, Scene} from "three";
import {HttpClient} from "@angular/common/http";
import {DragControls} from "three/examples/jsm/controls/DragControls";
type Tile = {tile:number[]};
const setBlack = (textureCube2: THREE.Texture) => {
  return [
    new THREE.MeshBasicMaterial({color: 'black'}),

    new THREE.MeshBasicMaterial({color: 'black'}),
    new THREE.MeshBasicMaterial({
      map: textureCube2
    }),
    new THREE.MeshBasicMaterial({color: 'black'}),
    new THREE.MeshBasicMaterial({color: 'black'}),
    new THREE.MeshBasicMaterial({color: 'black'})

  ]
};
const TileColor=['Green','Blue','Purple','Red','Orange','Yellow']
const TileShape=['Circle','Square','Diamond','Clover','FourPointStar','EightPointStar']
@Component({
  selector: 'app-cube',
  templateUrl: './cube.component.html',
  styleUrls: ['./cube.component.scss']
})
export class CubeComponent implements OnInit {

  @ViewChild('canvas',{static:true}) canvasElementRef!: ElementRef<HTMLCanvasElement> ;
  private results: Tile[]=[];
   loadJSON(url:string) {
    return new Promise(resolve => {
      new THREE.TextureLoader().load(url, resolve);
    });
  }

  fileData: File = {} as File;
  private test: BlobPart[]=[];

  private createScene() {
    const frustumSize = 100;
    const width = 1500;
    const height = 1000;
    const aspect = width / height;
    const scene = new THREE.Scene();
    // const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const camera = new THREE.OrthographicCamera(
      (frustumSize * aspect) / -2, // left — Camera frustum left plane.
      (frustumSize * aspect) / 2, // right — Camera frustum right plane.
      frustumSize / 2, // top — Camera frustum top plane.
      frustumSize / -2, // bottom — Camera frustum bottom plane.
      1, // near — Camera frustum near plane.
      2000// far — Camera frustum far plane.
    );

    camera.position.set(0, 0, 60);



    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true ,canvas: this.canvasElementRef.nativeElement});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);

    window.addEventListener('resize',()=>{
      // camera.aspect=window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld();
    })
    document.body.appendChild(renderer.domElement);
    // const geometry = new THREE.BoxGeometry(3, 1, 3);
    // const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);


    directionalLight.position.set(0, 1, 10);

   const textureLoader=new THREE.TextureLoader();
    textureLoader.setPath( './assets/img/' );

    const materials: THREE.MeshBasicMaterial[][]=[]
    this.results?.forEach(val=>materials.push(setBlack(textureLoader.load(
      TileColor[val.tile[0]-1]+TileShape[val.tile[1]-1]+'.svg'
    ))));



    const cubes:any[]=[]
    materials.forEach((material,index)=>{
      const cube = new THREE.Mesh(new THREE.BoxGeometry(5, 2, 5), material);
      cube.position.set(4*this.results[index].tile[2]+this.results[index].tile[3]*4, 4*this.results[index].tile[3]-4*this.results[index].tile[2], 0);

      cube.rotation.x = Math.PI * 0.5;
      cube.rotation.y = Math.PI * 0.25;
      scene.add(cube);
cubes.push(cube);

    })

scene.rotation.x = -Math.PI * 0.33
    const controls = new DragControls(cubes, camera, renderer.domElement)
    let uuid:number;
    let pointpred: { x:number,y:number };
controls.addEventListener('dragstart', event => {
    console.log(event.object.position)
  pointpred={x:event.object.position.x,y:event.object.position.y}
    uuid=event.object.parent.children.findIndex((child:any) => child.uuid===event.object.uuid)
  console.log(this.results[uuid])
})
controls.addEventListener('dragend', event => {
  console.log(event.object.position,pointpred)
  // x' = -0.2*x + 0.4*y + 2
  // y' = -0.2*x + 0.4*y


  const x = Math.round(1/8*event.object.position.x-1/8*event.object.position.y);
  const y = Math.round(1/8*event.object.position.x+1/8*event.object.position.y);
  const deltaX = x - event.object.position.x;
  const deltaY = y - event.object.position.y;
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
console.log(distance)
  const foundPoint = this.results.find(point => point.tile[2] === x && point.tile[3] === y);
console.log(x,y,foundPoint)
if (distance>35){

}else if(foundPoint){

}else {

    this.results[uuid].tile[2]=x
    this.results[uuid].tile[3]=y
  this.results=this.results.map(item=>({ ...item }));
  this.http.post('http://127.0.0.1:4201/savetiles',this.results).subscribe();}
   location.reload();

})
    const animate = () => {
      // Start loop again
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }

    // function loop() {
    //
    //   renderer.render(scene, camera);
    //   requestAnimationFrame(loop);
    // };
    requestAnimationFrame(animate);
  }



  /**
   * Start the rendering loop
   *
   * @private
   * @memberof CubeComponent
   */


  constructor(public http: HttpClient) { }

  ngOnInit(): void {

    this.http.get('http://127.0.0.1:4201/gettiles').subscribe(data => {
      this.results=<Tile[]>data;
      this.createScene();
    });





  }




}
