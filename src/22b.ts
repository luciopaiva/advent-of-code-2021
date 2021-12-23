
import {readLines} from "./utils";

class Cuboid {

    public readonly size: number;

    constructor(
        public readonly label: string,
        public readonly x0: number,
        public readonly x1: number,
        public readonly y0: number,
        public readonly y1: number,
        public readonly z0: number,
        public readonly z1: number,
        public readonly sign: boolean,
    ) {
        this.size = Math.abs((x1 - x0 + 1) * (y1 - y0 + 1) * (z1 - z0 + 1));
    }

    intersect(other: Cuboid): Cuboid {
        const [x0, x1] = [Math.max(this.x0, other.x0), Math.min(this.x1, other.x1)];
        const [y0, y1] = [Math.max(this.y0, other.y0), Math.min(this.y1, other.y1)];
        const [z0, z1] = [Math.max(this.z0, other.z0), Math.min(this.z1, other.z1)];
        if (x1 < x0 || y1 < y0 || z1 < z0) {
            return undefined;
        }
        return new Cuboid(`${this.label} ∩ ${other.label}`, x0, x1, y0, y1, z0, z1, !this.sign);
    }

    count(): number {
        return this.sign ? this.size : -this.size;
    }
}

class Reactor {
    public size = 0;
    public cuboids: Cuboid[] = [];

    add(cuboid: Cuboid) {
        const changes: Cuboid[] = [];

        cuboid.sign && changes.push(cuboid);

        for (const other of this.cuboids) {
            const intersection = other.intersect(cuboid);
            intersection && changes.push(intersection);
        }

        for (const cuboid of changes) {
            this.cuboids.push(cuboid);
            this.size += cuboid.count();
        }
    }

    toString() {
        const terms = [this.cuboids[0].label];
        terms.push(...this.cuboids.slice(1).map(c => `${c.sign ? "+" : "-"} ${c.label}`));
        return terms.join(" ");
    }

    largestIntersection(): number {
        return Math.max(...this.cuboids.map(c => c.label.split("").filter(c => c === "∩").length));
    }
}

async function run(fileName: string, dump = false) {
    const reactor = new Reactor();
    let id = 1;
    const range = "(-?[\\d]+)\\.\\.(-?[\\d]+)";
    const re = new RegExp(`(on|off).x=${range}.y=${range}.z=${range}`);

    for await (const line of readLines(fileName)) {
        const m = line.match(re);
        const [a, b, c, d, e, f] = m.slice(2).map(n => Number(n));
        reactor.add(new Cuboid(`C${id++}`, a, b, c, d, e, f, m[1] === "on"));
    }

    dump && console.info(`[${fileName}] ${reactor}`);
    console.info(`[${fileName}] resulting cuboids: ${reactor.cuboids.length}`);
    console.info(`[${fileName}] largest intersection: ${reactor.largestIntersection()}`);
    console.info(`[${fileName}] cubes turned on: ${reactor.size}`);
}

await run("input/22-example.txt", true);
await run("input/22.txt");
