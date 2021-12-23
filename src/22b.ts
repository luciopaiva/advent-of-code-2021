
import {readLines} from "./utils";

/*
Counting cubes worked for the first part, but it doesn't for the second part since were talking about a huge volume of
~200000^3 cubes. Even if we used a single bit for every cube, it would still be 200kb cubed (more than 900 TB!).
Whatever the solution is, it has to scale with the number of cuboids (which is in the order of hundreds), not cubes.

When turning on a cuboid, we just need to keep its coordinates and then calculate its volume to find out how many cubes
are turned on in it. The problem is when cuboids intersect.

When two cuboids intersect, just saving both cuboids won't do because we'd be counting their intersection twice. To fix
that, we create a new cuboid which is the intersection of the two, and assign a negative sign to it counts negatively
when calculating the total amount of cubes turned on.

When a third cube is added, we have to test it against the first two and intersect them the same way as before. However,
if all three intersect together, the volume being shared by all 3 requires further attention. By adding A, B and C, then
discounting A ∩ B, A ∩ C, and B ∩ C. Notice, however, that by doing this we are removing the intersection A ∩ B ∩ C
3 times instead of just 2, so we end up with a whole there. To fic this, we need to sum A ∩ B ∩ C in the end. Notice
that the sign keeps changing for every new level of intersection, so we just need to keep track of it as we go.

This is an example of how the algorithm should work:

- add A: A
- add B: + B - A ∩ B
- add C: + C - A ∩ C - B ∩ C + A ∩ B ∩ C

When we add C, notice that we can make use of the precalculated intersections. If we have:

    [A, B, -A ∩ B]

Adding C is just a matter of traversing the existing list and intersecting every existing cuboid with C:

    A -> -A ∩ C
    B -> -B ∩ C
    -A ∩ B -> A ∩ B ∩ C

And, of course, add C as well.

Note that this could quickly grow to a huge amount of cuboids:

    A
    A + B - A ∩ B
    A + B - A ∩ B + C - A ∩ C - B ∩ C + A ∩ B ∩ C

The progression of cuboids is 1, 3, 7, 15, and so on. If we have n cuboids in the input file, that could potentially
turn into 2^n - 1 cuboids. Since we have 420 lines in the input, that'd grow to 2.7E+126 cuboids! Thankfully, cuboids
intersect with very few other cuboids, so the vast majority of possible intersections that would turn into new cuboids
are actually empty and do not convert into a new element in the list.

Finally, there are the subtracting rules in the input file. If we had A + B and were to subtract C, this is what we
would get:

    A + B - A ∩ B - A ∩ C - B ∩ C + A ∩ B ∩ C

We need to subtract C from A, C from B, but add back the part that was taken twice from A ∩ B. Notice that that's
exactly what we'd do if we were adding C, but with the obvious exception that C is not being added.

Check Reactor.add() to see the algorithm in action.
 */

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
        return Math.max(...this.cuboids.map(c => c.label.split("").filter(c => c === "∩").length + 1));
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
