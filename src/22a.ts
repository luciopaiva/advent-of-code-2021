
import {readLines} from "./utils";

function encode(x: number, y: number, z: number): string {
    return `${x}.${y}.${z}`;
}

class Reactor {
    public cubes: Set<string> = new Set();

    cuboid(on: boolean, coords: number[]) {
        for (let x = coords[0]; x <= coords[1]; x++) {
            for (let y = coords[2]; y <= coords[3]; y++) {
                for (let z = coords[4]; z <= coords[5]; z++) {
                    on ? this.cubes.add(encode(x, y, z)) : this.cubes.delete(encode(x, y, z));
                }
            }
        }
    }
}

async function run(fileName: string) {
    const reactor = new Reactor();
    for await (const line of readLines(fileName)) {
        const m = line.match(/(on|off).x=(-?[\d]+)\.\.(-?[\d]+).y=(-?[\d]+)\.\.(-?[\d]+).z=(-?[\d]+)\.\.(-?[\d]+)/);
        const coords = m.slice(2).map(n => Number(n));
        if (coords.every(c => c >= -50 && c <= 50)) {
            reactor.cuboid(m[1] === "on", coords);
        }
    }

    console.info(`[${fileName}] cubes on: ${reactor.cubes.size}`);
}

await run("input/22-example.txt");
await run("input/22.txt");
