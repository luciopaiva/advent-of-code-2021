
import {readLines} from "./utils";

class Octopus {
    public flashCount = 0;
    public hasFlashed = false;

    constructor(public level: number) {
    }

    levelUp() {
        this.level++;
    }

    flash() {
        this.flashCount++;
        this.level = 0;
        this.hasFlashed = true;
    }

    tryFlash(): boolean {
        if (this.level > 9 && !this.hasFlashed) {
            this.flash();
            return true;
        }
        return false;
    }

    reset() {
        this.hasFlashed = false;
    }
}

class Grid<T> {
    constructor(private width: number, private height: number, private matrix: T[]) {
    }

    get(x: number, y: number): T {
        if (x >= 0 && y >= 0 && x < this.width && y < this.height) {
            const index = y * this.width + x;
            return this.matrix[index];
        }
        return undefined;
    }

    all(): T[] {
        return this.matrix;
    }
}

class Simulation {
    private grid: Grid<Octopus>;

    constructor(private width: number, private height: number, private matrix: Octopus[]) {
        this.grid = new Grid(width, height, matrix);
    }

    step() {
        for (const octopus of this.grid.all()) {
            octopus.levelUp();
        }

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.tryFlash(x, y);
            }
        }

        for (const octopus of this.grid.all()) {
            octopus.reset();
        }
    }

    didAllFlash(): boolean {
        return this.grid.all().map(o => o.level).reduce((sum, l) => sum + l, 0) === 0;
    }

    tryFlash(x: number, y: number) {
        const octopus = this.grid.get(x, y);
        if (octopus instanceof Octopus && octopus.tryFlash()) {
            this.tryLevelUp(x, y - 1);
            this.tryLevelUp(x + 1, y - 1);
            this.tryLevelUp(x + 1, y);
            this.tryLevelUp(x + 1, y + 1);
            this.tryLevelUp(x, y + 1);
            this.tryLevelUp(x - 1, y + 1);
            this.tryLevelUp(x - 1, y);
            this.tryLevelUp(x - 1, y - 1);
        }
    }

    tryLevelUp(x: number, y: number) {
        const octopus = this.grid.get(x, y);
        if (octopus instanceof Octopus && !octopus.hasFlashed) {
            octopus.levelUp();
            this.tryFlash(x, y);
        }
    }

    dump() {
        console.info("");
        for (let y = 0; y < this.height; y++) {
            const line = [];
            for (let x = 0; x < this.width; x++) {
                line.push(this.grid.get(x, y).level)
            }
            console.info(line.map(l => l === 0 ? " " : l).join(""));
        }
    }

    getNumberOfFlashes(): number {
        return this.grid.all().map(o => o.flashCount).reduce((sum, c) => sum + c, 0);
    }
}

async function run(fileName: string) {
    const octopuses = [];
    let width = 0;
    let height = 0;
    for await (const line of readLines(fileName)) {
        width = line.length;
        height++;
        octopuses.push(...line.split("").map(s => parseInt(s)).map(l => new Octopus(l)));
    }

    const sim = new Simulation(width, height, octopuses);
    for (let i = 1; i <= 10000; i++) {
        sim.step();
        if (i === 100) {
            console.info(`[${fileName}] Flashes after 100 steps: ${sim.getNumberOfFlashes()}`);
        }
        if (sim.didAllFlash()) {
            console.info(`[${fileName}] First step during which all flashed: ${i}`);
            if (i >= 100) {
                break;
            }
        }
    }
}

await run("input/11-example.txt");
await run("input/11.txt");
