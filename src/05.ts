
import {range, readLines} from "./utils";

class Point {
    constructor(public x: number, public y: number) {
    }
    toString() {
        return `${this.x},${this.y}`;
    }
}

class Line {
    public p1: Point;
    public p2: Point;

    constructor(str: string) {
        const m = str.match(/(\d+),(\d+) -> (\d+),(\d+)/)
        if (!m) {
            throw new Error(`Invalid input "${str}"`);
        }
        this.p1 = new Point(parseInt(m[1]), parseInt(m[2]));
        this.p2 = new Point(parseInt(m[3]), parseInt(m[4]));
    }

    *points(wantsDiagonals: boolean): Generator<Point> {
        if (this.p1.x === this.p2.x) {  // vertical
            for (let y of range(this.p1.y, this.p2.y)) {
                yield new Point(this.p1.x, y);
            }
        } else if (this.p1.y === this.p2.y) {  // horizontal
            for (let x of range(this.p1.x, this.p2.x)) {
                yield new Point(x, this.p1.y);
            }
        } else if (wantsDiagonals) {  // diagonal
            const xStep = Math.sign(this.p2.x - this.p1.x);
            const yStep = Math.sign(this.p2.y - this.p1.y);
            for (let x = this.p1.x, y = this.p1.y; !(x === this.p2.x && y === this.p2.y); x += xStep, y += yStep) {
                yield new Point(x, y);
            }
            yield new Point(this.p2.x, this.p2.y);
        }
    }

    toString() {
        return `${this.p1} => ${this.p2}`;
    }
}

class Solution {
    visitedCount: Map<string, number> = new Map();
    pointsVisitedMoreThanOnce = 0;

    static async run(wantsDiagonals: boolean) {
        const self = new Solution();

        for await (const lineStr of readLines("input/05.txt")) {
            const line = new Line(lineStr);
            for (const p of line.points(wantsDiagonals)) {
                const pStr = p.toString();
                const count = self.visitedCount.get(pStr) ?? 0;
                if (count === 1) {
                    self.pointsVisitedMoreThanOnce++;
                }
                self.visitedCount.set(pStr, count + 1);
            }
        }

        console.info(`Points visited more than once (with${wantsDiagonals ? "" : "out"} diagonals): ` +
            self.pointsVisitedMoreThanOnce);
    }
}

await Solution.run(false);
await Solution.run(true);
