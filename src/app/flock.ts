import { Bird } from './bird';

export class Flock {
    private birds: Bird[] = []

    constructor(num: Number) {
        for (let i = 0; i < num; i++) {
            this.birds.push(new Bird());
        }
    }

    public update(wallDistance: number): void {
        const birds = this.getBirds();
        for (let i = 0; i < this.birds.length; i++) {
            this.birds[i].applyBehaviour(birds, wallDistance);
            this.birds[i].update();
        }
    }

    public getBirds(): Bird[] {
        return this.birds.slice();
    }
}