
import * as fs from "fs";

class Vector {
    constructor(public x: number, public y: number) {
    }
    static from(other: Vector) {
        return new Vector(other.x, other.y);
    }
    add(other: Vector) {
        this.x += other.x;
        this.y += other.y;
    }
    toString() {
        return `[${this.x},${this.y}]`;
    }
}

function *range(from: number, to: number): Generator<number> {
    [from, to] = [Math.min(from, to), Math.max(from, to)];
    for (let i = from; i <= to; i++) {
        yield i;
    }
}

function stepsForFinalVelocityZeroAt(x: number) {
    // this is the formula for the roots of the quadratic equation derived from the triangular number formula
    // here we only consider the positive root (since the submarine is only shooting to the right of 0,0)
    return Math.ceil((-1 + Math.sqrt(1 + 8 * x)) / 2);
}

function run(fileName: string) {
    const line = fs.readFileSync(fileName, "utf-8");
    console.info(line);
    const m = line.match(/x=(-?\d+)\.\.(-?\d+).*y=(-?\d+)\.\.(-?\d+)/);
    const [x0, x1, y1, y0] = m.slice(1).map(s => parseInt(s));
    console.info(x0, x1, y0, y1);

    // a shot aiming up will eventually return to altitude 0 with the same initial speed. If we want to go the highest
    // possible and still hit the target area, we want to aim at the bottom row (-93 in the input). To get there in a
    // single step coming from altitude 0 (to go faster than that, we'd have to come from a higher altitude, but we
    // can't since we are launching from 0), we need to fire it upwards with speed 92. It will come back with speed -92
    // and then in the next step it will increase the speed to -93, hitting the bottom row as intended
    const v0h = -y1 - 1;
    // the maximum altitude is the sum of all integer numbers from 1 to v0h
    const h = v0h * (v0h + 1) / 2
    console.info(`[${fileName}] Part one ${"=".repeat(30)}`);
    console.info("  Highest altitude: " + h);

    console.info(`[${fileName}] Part two ${"=".repeat(30)}`);

    // this is a direct shot aiming down at the bottom row of the target area
    const minVy = y1;
    // this is a shot straight up, the higher we can go and still hit the target area (bottom row)
    const maxVy = -y1 - 1;

    console.info("  Min initial vy = " + minVy);
    console.info("  Max initial vy = " + maxVy);

    // this is the lowest speed we can launch the probe and still get to the first column of the target area
    const minVx = stepsForFinalVelocityZeroAt(x0);
    // this is the highest speed we can launch the probe and still touch the last column of the target area before
    // the probe is gone
    const maxVx = x1;
    console.info("  Min initial vx = " + minVx)
    console.info("  Max initial vx = " + maxVx);

    let attempts = 0;
    let totalValidShots = 0;

    for (const v0x of range(minVx, maxVx)) {
        for (const v0y of range(minVy, maxVy)) {
            const v0 = new Vector(v0x, v0y);
            const s = new Vector(0, 0);
            const v = Vector.from(v0);
            while (s.x <= x1 && s.y >= y1) {
                attempts++;
                if (s.x >= x0 && s.y <= y0) {
                    console.info(`  - hit at ${s}, initial velocity ${v0}`);
                    totalValidShots++;
                    break;
                }
                s.add(v);
                v.x = Math.max(v.x - 1, 0);
                v.y--;
            }
        }
    }

    console.info("  Total attempts: " + attempts);
    console.info("  Total valid shots: " + totalValidShots);
}

run("input/17-example.txt");
run("input/17.txt");
