import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import * as THREE from "three";
import {
  Color,
  Material,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  OrthographicCamera,
  Scene,
  WebGLRenderer
} from "three";
import {HttpClient} from "@angular/common/http";
import {DragControls} from "three/examples/jsm/controls/DragControls";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader";

type Tile = {tile:number[]};
type Player = {point:number,tilecolor:number[],tileshape:number[]};
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

  @ViewChild('canvas',{static:true}) canvasElementRef: ElementRef<HTMLCanvasElement> | undefined ;
  private results: Tile[]=[];
  private player1: Player={point:0,tilecolor:[],tileshape:[]};
  private player2: Player={point:0,tilecolor:[],tileshape:[]};
  private resultsplayer: Tile[]=[];
  // private renderer: WebGLRenderer=new THREE.WebGLRenderer();
  private score1: number = 0;
  private score2: number = 0;
  public show: boolean=true;
   loadJSON(url:string) {
    return new Promise(resolve => {
      new THREE.TextureLoader().load(url, resolve);
    });
  }

  fileData: File = {} as File;
  private test: BlobPart[]=[];
  private uuidvalue: any;
  private pointpred: any;
  private scene: Scene =new THREE.Scene();
  private camera: OrthographicCamera=new THREE.OrthographicCamera();
  private renderer : WebGLRenderer =new THREE.WebGLRenderer();
  private RACKPLAYER2: number=24;

  private createScene() {
this.scene.clear()
  // @ts-ignore
    this.renderer=new THREE.WebGLRenderer({ canvas:document.getElementById('canvas'),antialias: true });
    const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 1500);
    camera.position.set(-35, 70, 100);
    camera.lookAt(new THREE.Vector3(0, 0, 0));


// RENDERER
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    document.getElementById('myCanvas');
    document.body.appendChild(this.renderer.domElement);

// WINDOW RESIZE HANDLING

    window.addEventListener('resize', ()=>{
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);


    });
// SCENE
    this.scene.background = new THREE.Color(0xbfd1e5);

// CONTROLS
    const controls = new OrbitControls(camera, this.renderer.domElement);


    const animate = () => {
//     // Start loop again
//     // renderer.autoClear = false
      dragObject();
    requestAnimationFrame(animate);

    this.renderer.render(this.scene, camera);
    }
// ambient light
    let hemiLight = new THREE.AmbientLight(0xffffff, 0.30);
    this.scene.add(hemiLight);

//Add directional light
    let dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(-30, 50, -30);
    this.scene.add(dirLight);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.left = -70;
    dirLight.shadow.camera.right = 70;
    dirLight.shadow.camera.top = 70;
    dirLight.shadow.camera.bottom = -70;



// box
    const createBox = () => {
      let scale = { x: 6, y: 6, z: 6 }
      let pos = { x: 15, y: scale.y / 2, z: 15 }

      let box = new THREE.Mesh(new THREE.BoxBufferGeometry(),
        new THREE.MeshPhongMaterial({ color: 0xDC143C }));
      box.position.set(pos.x, pos.y, pos.z);
      box.scale.set(scale.x, scale.y, scale.z);
      box.castShadow = true;
      box.receiveShadow = true;
      this.scene.add(box)

      box.userData.draggable = true
      box.userData.name = 'BOX'



    };


    const createcube = () =>{
      const textureLoader=new THREE.TextureLoader();
    textureLoader.setPath( './assets/img/' );

    const materials: THREE.MeshBasicMaterial[][]=[]
    this.results?.forEach(val=>materials.push(setBlack(textureLoader.load(
      TileColor[val.tile[0]-1]+TileShape[val.tile[1]-1]+'.svg'
    ))));



    const cubes:any[]=[]
      // this.RACKPLAYER2=Math.max(...this.results.map(val=>val.tile[3]))+5
    materials.forEach((material,index)=>{
      const cube = new THREE.Mesh(new THREE.BoxGeometry(), material);
      let scale = { x: 5, y: 2, z:5 }
      let pos = { x: 5*this.results[index].tile[2], y: scale.y / 2, z: 5*this.results[index].tile[3] }
      cube.position.set(pos.x, pos.y, pos.z);
      cube.scale.set(scale.x, scale.y, scale.z);
      cube.castShadow = true;
      cube.receiveShadow = true;
      cube.userData.draggable=false
      console.log(cube.position ,this.RACKPLAYER2)
      if (pos.z===5*this.RACKPLAYER2) cube.userData.draggable = true

      cube.userData.name=index;
      // cube.position.set(4*this.results[index].tile[2]+this.results[index].tile[3]*4, 4*this.results[index].tile[3]-4*this.results[index].tile[2], 0);

      this.scene.add(cube);
cubes.push(cube);

    })

}

    const createFloor = () => {
      let pos = { x: 0, y: -2, z: 3 };
      let scale = { x: 250, y: 5, z: 250 };
      const textureLoader=new THREE.TextureLoader();
      textureLoader.setPath( './assets/img/' );


      let material: THREE.MeshBasicMaterial[]=[]
      material=setBlack(textureLoader.load('cartejeu.jpg'))

      let carpet = new THREE.Mesh(new THREE.BoxBufferGeometry(),
        material);

      carpet.position.set(pos.x, pos.y, pos.z);
      carpet.scale.set(scale.x, scale.y, scale.z);
      carpet.castShadow = true;
      carpet.receiveShadow = true;
      this.scene.add(carpet);

      carpet.userData.ground = true
    };


    const raycaster = new THREE.Raycaster(); // create once
    const clickMouse = new THREE.Vector2();  // create once
    const moveMouse = new THREE.Vector2();   // create once
    let draggable: THREE.Object3D;

    const intersect = (pos: THREE.Vector2) => {
      raycaster.setFromCamera(pos, camera);
      return raycaster.intersectObjects(this.scene.children);
    };
let indexdrag=0;
 this.resultsplayer=[]
    window.addEventListener('click', event => {
      if (draggable != null) {
        this.results[indexdrag].tile[2]=draggable.position.x/5
        this.results[indexdrag].tile[3]=draggable.position.z/5
        const found = this.resultsplayer.some(item => item.tile[0] ===  this.results[indexdrag].tile[0] &&item.tile[1] ===  this.results[indexdrag].tile[1] &&
          item.tile[2] ===  this.results[indexdrag].tile[2] &&item.tile[3] ===  this.results[indexdrag].tile[3]);

        if (!found) this.resultsplayer.push(this.results[indexdrag])
        this.resultsplayer=this.resultsplayer.filter(val=>val.tile[3]!==this.RACKPLAYER2).map(val=>val)
        console.log("dropping draggable ",this.resultsplayer)
        draggable = null as any
        return;
      }

      // THREE RAYCASTER
      // clickMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      // clickMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      var rect = this.renderer.domElement.getBoundingClientRect();
      clickMouse.x = ( ( event.clientX - rect.left ) / ( rect.right - rect.left ) ) * 2 - 1;
      clickMouse.y = - ( ( event.clientY - rect.top ) / ( rect.bottom - rect.top) ) * 2 + 1;
      const found = intersect(clickMouse);
      if (found.length > 0) {
        if (found[0].object.userData.draggable) {
          draggable = found[0].object
          indexdrag=found[0].object.userData.name
          console.log("found draggable",this.results[indexdrag],found[0].object.userData.name)


        }
      }
    })

    window.addEventListener('mousemove', event => {
      moveMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      moveMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    function dragObject() {
      if (draggable != null) {
        const found = intersect(moveMouse);
        if (found.length > 0) {
          for (let i = 0; i < found.length; i++) {
            if (!found[i].object.userData.ground)
              continue

            let target = found[i].point;
            draggable.position.x = Math.round(target.x/5)*5
            draggable.position.z = Math.round(target.z/5)*5
          }
        }
      }
    }


    createFloor()
    createcube()
    animate()

  }

  /**
   * Start the rendering loop
   *
   * @private
   * @memberof CubeComponent
   */


  constructor(public http: HttpClient) { }

  ngOnInit(): void {
    this.http.get('http://127.0.0.1:5000/gamereload').subscribe(data => {
      this.results=<Tile[]>data;

      console.log(this.results);
      this.createScene();
    });




  }


  getGame() {
    this.http.get('http://127.0.0.1:5000/play').subscribe(data => {
      this.results=<Tile[]>data;
      this.RACKPLAYER2=Math.max(...this.results.map(val=>val.tile[3]))+5

      this.player2.tilecolor.forEach((tilecolor,index) => {

        this.results.push({tile:[tilecolor,this.player2.tileshape[index],-index+3,this.RACKPLAYER2]})
        this.show=true;

      })
      console.log(this.player2);
      console.log(this.results);

    this.http.get('http://127.0.0.1:5000/player2').subscribe(data => {
      this.player2=<Player>data;
      this.http.get('http://127.0.0.1:5000/player1').subscribe(data => {
        this.player1=<Player>data;
      });
    });

    this.createScene();
    });
  }

  getplayer2() {
    this.http.get('http://127.0.0.1:5000/gamereload').subscribe(data => {
      this.results=<Tile[]>data;
      this.RACKPLAYER2=Math.max(...this.results.map(val=>val.tile[3]))+5
      this.http.get('http://127.0.0.1:5000/player2').subscribe(data => {
        this.player2=<Player>data;
        this.player2.tilecolor.forEach((tilecolor,index) => {

          this.results.push({tile:[tilecolor,this.player2.tileshape[index],-index+3,this.RACKPLAYER2]})
          this.http.get('http://127.0.0.1:5000/player1').subscribe(data => {
            this.player1=<Player>data;
          });
        })
        this.createScene();
        if (this.show===false) this.getGame();
      });
    });


  }

  playPlayer2() {

    this.http.post('http://127.0.0.1:5000/player2play',this.resultsplayer).subscribe((val)=>
    {
      if (val==='True') {this.show=false}
      this.getplayer2();
    })
  }

  getscoreplayer1():string {
    return "score player1: " + this.player1.point;
  }

  getscoreplayer2():string {
    return "score player2: " +  this.player2.point;
  }

  getshow() {
    return this.show
  }
}
