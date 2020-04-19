import { Mesh, Vector3, ConeGeometry, MeshLambertMaterial } from 'three';

export class Bird extends Mesh {
  velocity: Vector3;
  acceleration: Vector3;
  alignRadius = 45;
  cohesionRadius = 35;
  separationRadius = 25;
  maxSpeed = 3;
  maxForce = 0.025;

  constructor() {
    super();
    this.geometry = new ConeGeometry(1, 7);
    this.material = new MeshLambertMaterial( { color: 0x3b4359, emissive: 0xb0f } );
    this.position.set(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5);
    this.position.multiplyScalar(150);
    this.velocity = new Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5);
    this.velocity.multiplyScalar(2);
    this.acceleration = new Vector3();
    this.quaternion.setFromUnitVectors(new Vector3(0,1,0), this.velocity.clone().normalize());
  }

  public alignment(birds: Bird[]): Vector3 {
    let steering = new Vector3();
    let total = 0;

    for (let other of birds) {
      let d = this.position.manhattanDistanceTo(other.position);
      if (other != this && d < this.alignRadius) {
        steering.add(other.velocity);
        total++;
      }
    }

    if (total > 0) {
      steering.divideScalar(total);
      steering.setLength(this.maxSpeed);
      steering.sub(this.velocity);
      steering.clampLength(0, this.maxForce);
    }
    return steering;
  }

  public cohesion(birds: Bird[]): Vector3 {
    let steering = new Vector3();
    let total = 0;

    for (let other of birds) {
      let d = this.position.manhattanDistanceTo(other.position);
      if (other != this && d < this.cohesionRadius) {
        steering.add(other.position);
        total++;
      }
    }

    if (total > 0) {
      steering.divideScalar(total);
      steering.sub(this.position);
      steering.setLength(this.maxSpeed);
      steering.sub(this.velocity);
      steering.clampLength(0, this.maxForce);
    }
    return steering;
  }

  public separation(birds: Bird[]): Vector3 {
    let steering = new Vector3();
    let total = 0;

    for (let other of birds) {
      let d = this.position.manhattanDistanceTo(other.position);
      if (other != this && d < this.separationRadius) {
        let diff = this.position.clone();
        diff.sub(other.position);
        diff.divideScalar(d);
        steering.add(diff);
        total++;
      }
    }

    if (total > 0) {
      steering.divideScalar(total);
      steering.setLength(this.maxSpeed);
      steering.sub(this.velocity);
      steering.clampLength(0, this.maxForce);
    }
    return steering;
  }

  public avoidWalls(wallDistance: number): Vector3 {
    // Check how close we are to each wall
    let steer = new Vector3();

    const dx = Math.abs(this.position.x - wallDistance);
    const dy = Math.abs(this.position.y - wallDistance);
    const dz = Math.abs(this.position.z - wallDistance);

    // Right and let walls
    if (this.position.x > 0.9*wallDistance) {
      const diff = new Vector3(-1, 0, 0);
      diff.divideScalar(dx);
      steer.add(diff);
    } else if (this.position.x < -0.9*wallDistance) {
      const diff = new Vector3(1, 0, 0);
      diff.divideScalar(dx);
      steer.add(diff);
    }

    // Front and back walls
    if (this.position.y > 0.9*wallDistance) {
      const diff = new Vector3(0, -1, 0);
      diff.divideScalar(dy);
      steer.add(diff);
    } else if (this.position.y < -0.9*wallDistance) {
      const diff = new Vector3(0, 1, 0);
      diff.divideScalar(dy);
      steer.add(diff);
    }

    // Top and bottom walls
    if (this.position.z > 0.9*wallDistance) {
      const diff = new Vector3(0, 0, -1);
      diff.divideScalar(dz);
      steer.add(diff);
    } else if (this.position.z < -0.9*wallDistance) {
      const diff = new Vector3(0, 0, 1);
      diff.divideScalar(dz);
      steer.add(diff);
    }

    steer.clampLength(0, this.maxForce);
    return steer;
  }

  public applyBehaviour(birds: Bird[], wallDistance: number) {
    this.acceleration.multiplyScalar(0);
    let alignment = this.alignment(birds);
    let cohesion = this.alignment(birds);
    let separation = this.separation(birds);
    let avoidWalls = this.avoidWalls(wallDistance);

    alignment.multiplyScalar(1);
    cohesion.multiplyScalar(1);
    separation.multiplyScalar(1);
    avoidWalls.multiplyScalar(2);

    this.acceleration.add(alignment);
    this.acceleration.add(cohesion);
    this.acceleration.add(separation);
    this.acceleration.add(avoidWalls);
  }

  public update(): void {
    this.position.add(this.velocity);
    this.velocity.add(this.acceleration);
    this.velocity.clampLength(0, this.maxSpeed);

    this.quaternion.setFromUnitVectors(
      new Vector3(0,1,0),
      this.velocity.clone().normalize()
      );
  }

}