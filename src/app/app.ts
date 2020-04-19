import { DirectionalLight, Mesh, Color, PerspectiveCamera, Scene, Vector3, WebGLRenderer, TextureLoader, LinearFilter, ShaderLib, ShaderMaterial, BackSide, BoxBufferGeometry } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Flock } from './flock';
import  SkyBoxImg  from '../img/sky.jpg';

export class App {
  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 10000); 
  private readonly renderer = new WebGLRenderer({
    antialias: true,
    canvas: document.getElementById('main-canvas') as HTMLCanvasElement,
  });

  private bgMesh: Mesh
  private controls: OrbitControls
  private flock: Flock
  private radius = 180
  private light: DirectionalLight

  constructor() {
    this.flock = new Flock(1000);

    this.flock.getBirds().forEach(bird => {
      this.scene.add(bird);
    });

    this.camera.position.set(200, 200, 200);
    this.camera.lookAt(new Vector3(0, 0, 0));

    this.renderer.setSize(innerWidth, innerHeight);
    this.renderer.setClearColor(new Color('rgb(0,0,0)'));

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    const loader = new TextureLoader();
    const texture = loader.load(SkyBoxImg);
    texture.magFilter = LinearFilter;
    texture.minFilter = LinearFilter;

    const shader = ShaderLib.equirect;
    const material = new ShaderMaterial({
      fragmentShader: shader.fragmentShader,
      vertexShader: shader.vertexShader,
      uniforms: shader.uniforms,
      depthWrite: false,
      side: BackSide
    });

    material.uniforms.tEquirect.value = texture;

    const plane = new BoxBufferGeometry(2000,2000,2000);
    this.bgMesh = new Mesh(plane, material);

    this.scene.add(this.bgMesh);

    this.renderer.autoClearColor = false;

    this.light = new DirectionalLight(0xFFFFF, 1);
    this.light.position.set(-1, 2, 4);
    this.scene.add(this.light);

    this.render();
  }

  private adjustCanvasSize() {
    this.renderer.setSize(innerWidth, innerHeight);
    this.camera.aspect = innerWidth / innerHeight;
    this.camera.updateProjectionMatrix();
  }

  private render() {

    this.bgMesh.position.copy(this.camera.position);

    this.flock.update(this.radius);
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.render());

    this.adjustCanvasSize();
  }
}
