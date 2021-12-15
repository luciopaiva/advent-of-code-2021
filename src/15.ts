
import * as fs from "fs";

class Solution {

    private readonly side: number;

    private queue: number[];
    private costs: number[];
    private previous: number[];
    private visited: Set<number>;
    private start: number;

    constructor(private risks: number[]) {
        this.side = Math.sqrt(this.risks.length);
        this.reset();
    }

    reset() {
        this.costs = Array<number>(this.risks.length).fill(Number.POSITIVE_INFINITY);
        this.previous = Array<number>(this.risks.length);
        this.visited = new Set<number>();
        this.queue = [];
    }

    dijkstra(start: number, end: number) {
        this.reset();
        this.start = start;

        this.visited.add(start);
        this.costs[start] = 0;
        this.enqueue(start);

        while (this.queue.length > 0) {
            const v = this.queue.pop();
            if (v === end) {
                break;
            }
            for (const n of this.neighbors(v)) {
                if (!this.visited.has(n)) {
                    const distance = this.costs[v] + this.risks[n];
                    if (distance < this.costs[n]) {
                        this.costs[n] = distance;
                        this.previous[n] = v;
                        this.enqueue(n);
                    }
                }
            }
            this.visited.add(v);
        }

        return this.costs[end];
    }

    *neighbors(i: number): Generator<number> {
        const [x, y] = this.coord(i);
        if (y > 0) yield i - this.side;
        if (x + 1 < this.side) yield i + 1;
        if (y + 1 < this.side) yield i + this.side;
        if (x > 0) yield i - 1;
    }

    enqueue(i: number) {
        this.queue.push(i);
        this.queue.sort((a, b) => this.costs[b] - this.costs[a]);
    }

    coord(i: number): [number, number] {
        return [i % this.side, Math.floor(i / this.side)];
    }

    dump(matrix: number[]) {
        const side = Math.sqrt(matrix.length);
        for (let y = 0; y < side; y++) {
            console.info(matrix.slice(y * side, y * side + side)
                .map(n => n.toString())
                .map(s => s === "Infinity" ? "∞" : s)
                .map(s => s.padStart(3, " "))
                .join(""));
        }
    }

    dumpPath(end: number) {
        for (let i = end; i !== this.start; i = this.previous[i]) {
            const [x, y] = this.coord(i);
            console.info(x, y);
        }
        console.info(...this.coord(this.start));
    }

    static readRisksFile(fileName: string) {
        return fs.readFileSync(fileName, "utf-8")
            .replace(/\D/g, "")
            .split("")
            .map(n => parseInt(n));
    }

    static extendCave(risks: number[], multiplier: number): number[] {
        const len = risks.length;
        const side = Math.sqrt(len);
        const SIDE = side * multiplier;
        const extendedRisks = Array<number>(len * multiplier ** 2);
        for (let i = 0; i < len; i++) {
            const [ox, oy] = [i % side, Math.floor(i / side)];
            for (let y = 0; y < multiplier; y++) {
                const ey = oy + y * side;
                for (let x = 0; x < multiplier; x++) {
                    const ex = ox + x * side;
                    extendedRisks[ey * SIDE + ex] = (risks[i] + y + x - 1) % 9 + 1;
                }
            }
        }
        return extendedRisks;
    }

    static async run(fileName: string, multiplier = 1) {
        const startTime = process.hrtime.bigint();
        const baseRisks = Solution.readRisksFile(fileName);
        const risks = multiplier > 1 ? Solution.extendCave(baseRisks, multiplier) : baseRisks;

        const solution = new Solution(risks);
        const start = 0;
        const end = risks.length - 1;
        const totalRisk = solution.dijkstra(start, end);
        const elapsed = (process.hrtime.bigint() - startTime) / 1_000_000n;
        console.info(`[${fileName}] lowest total risk (cave size multiplier: ${multiplier}): ` +
            `${totalRisk} (${elapsed} ms)`);
    }
}

await Solution.run("input/15-example.txt");
await Solution.run("input/15-example.txt", 5);
await Solution.run("input/15.txt");
await Solution.run("input/15.txt", 5);
