
import * as fs from "fs";

async function run(fileName: string) {
    const risks = fs.readFileSync(fileName, "utf-8")
        .replace(/\D/g, "")
        .split("")
        .map(n => parseInt(n));
    const side = Math.sqrt(risks.length);
    const start = 0;
    const end = risks.length - 1;

    const distances = Array<number>(risks.length).fill(Number.POSITIVE_INFINITY);
    const previous = Array<number>(risks.length);
    const visited = new Set<number>([start]);

    distances[start] = 0;
    const queue = [start];

    function dump(matrix: number[]) {
        for (let y = 0; y < side; y++) {
            console.info(matrix.slice(y * side, y * side + side)
                .map(n => n.toString())
                .map(s => s === "Infinity" ? "∞" : s)
                .map(s => s.padStart(3, " "))
                .join(""));
        }
    }

    function enqueue(i: number) {
        queue.push(i);
        queue.sort((a, b) => distances[b] - distances[a]);
    }

    function coord(i: number): [number, number] {
        return [i % side, Math.floor(i / side)]
    }

    function *neighbors(i: number): Generator<number> {
        const [x, y] = coord(i);
        if (y > 0) yield i - side;
        if (x + 1 < side) yield i + 1;
        if (y + 1 < side) yield i + side;
        if (x > 0) yield i - 1;
    }

    while (queue.length > 0) {
        const v = queue.pop();
        if (v === end) {
            break;
        }
        for (const n of neighbors(v)) {
            if (!visited.has(n)) {
                const distance = distances[v] + risks[n];
                if (distance < distances[n]) {
                    distances[n] = distance;
                    previous[n] = v;
                    enqueue(n);
                }
            }
        }
        visited.add(v);
    }

    // dump(distances);
    //
    // // dump path
    // for (let i = end; i !== start; i = previous[i]) {
    //     const [x, y] = coord(i);
    //     console.info(x, y);
    // }
    // console.info(...coord(start));

    console.info(`[${fileName}] lowest total risk: ${distances[end]}`);
}

await run("input/15-example.txt");
await run("input/15.txt");
