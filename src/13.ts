
import {readLines} from "./utils";

function encode(a: number, b: number) {
    return (a << 11) | b;
}

function decode(v: number): [number, number] {
    const a = v >>> 11;
    const b = v & 0x7ff;
    return [a, b];
}

class Paper {

    private width = 0;
    private height = 0;
    private points: Set<number> = new Set();

    addPoint(x: number, y: number) {
        this.points.add(encode(x, y));
        this.width = Math.max(this.width, x + 1);
        this.height = Math.max(this.height, y + 1);
    }

    foldX(line: number) {
        console.info("fold x at " + line);
        this.fold((x, y) => {
            if (x >= line) {
                x = 2 * line - x;
                if (x >= 0) {
                    return encode(x, y);
                }
                return undefined;
            }
        });
    }

    foldY(line: number) {
        console.info("fold y at " + line);
        this.fold((x, y) => {
            if (y >= line) {
                y = 2 * line - y;
                if (y >= 0) {
                    return encode(x, y);
                }
                return undefined;
            }
        });
    }

    fold(callback: (x: number, y: number) => number | undefined) {
        const pointsToAdd: Set<number> = new Set();
        const pointsToRemove: Set<number> = new Set();
        for (const hash of this.points) {
            const [x, y] = decode(hash);
            const newHash = callback(x, y);
            if (typeof newHash === "number") {
                pointsToAdd.add(newHash);
                pointsToRemove.add(hash);
            }
        }
        for (const hash of pointsToRemove) {
            this.points.delete(hash);
        }
        for (const hash of pointsToAdd) {
            this.points.add(hash);
        }
    }

    dump(trimmed = false) {
        const matrix: string[] = Array(this.width * this.height).fill(trimmed ? " " : ".");
        for (const hash of this.points) {
            const [x, y] = decode(hash);
            matrix[y * this.width + x] = "#";
        }
        console.info("");
        for (let y = 0; y < this.height; y++) {
            const rowIndex = y * this.width;
            const line = matrix.slice(rowIndex, rowIndex + this.width).join("").trimEnd();
            if (line.length > 0) {
                console.info(line);
            }
        }
        console.info("");
    }

    getDotCount(): number {
        return this.points.size;
    }
}

class Parser {

    private paper = new Paper();
    private foldInstructions: Function[] = [];

    parseLine(line: string) {
        const mc = line.match(/(\d+),(\d+)/);
        if (mc) {
            const [x, y] = [parseInt(mc[1]), parseInt(mc[2])];
            this.paper.addPoint(x, y);
            return;
        }

        const mfy = line.match(/fold\salong\sy=(\d+)/);
        if (mfy) {
            this.foldInstructions.push(this.paper.foldY.bind(this.paper, parseInt(mfy[1])));
            return;
        }

        const mfx = line.match(/fold\salong\sx=(\d+)/);
        if (mfx) {
            this.foldInstructions.push(this.paper.foldX.bind(this.paper, parseInt(mfx[1])));
        }

        return;
    }

    static async run(fileName: string) {
        const parser = new Parser();
        for await (const line of readLines(fileName)) {
            parser.parseLine(line);
        }
        const paper = parser.paper;

        console.info(`[${fileName}] dots before first fold: ${paper.getDotCount()}`)

        const firstFold = parser.foldInstructions.shift();
        firstFold();
        console.info(`[${fileName}] dots after first fold: ${paper.getDotCount()}`)

        for (const fold of parser.foldInstructions) {
            fold();
        }
        console.info(`[${fileName}] dots after last fold: ${paper.getDotCount()}`)
        paper.dump(true);
    }
}

await Parser.run("input/13-example.txt");
await Parser.run("input/13.txt");
