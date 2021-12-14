
import {readLines, tryMatch} from "./utils";

function encode(a: number, b: number) {
    return (a << 11) | b;
}

function decode(v: number): [number, number] {
    const a = v >>> 11;
    const b = v & 0x7ff;
    return [a, b];
}

class Paper {

    private points: Set<number> = new Set();

    addPoint(x: number, y: number) {
        this.points.add(encode(x, y));
    }

    foldX(line: number) {
        this.fold((x, y) => x >= line && encode(2 * line - x, y));
    }

    foldY(line: number) {
        this.fold((x, y) => y >= line && encode(x, 2 * line - y));
    }

    fold(callback: (x: number, y: number) => number | undefined) {
        const pointsToAdd = [];
        for (const hash of this.points) {
            const newHash = callback(...decode(hash));
            if (typeof newHash === "number") {
                pointsToAdd.push(newHash);
                this.points.delete(hash);
            }
        }
        pointsToAdd.forEach(hash => this.points.add(hash));
    }

    dump() {
        const size = 2048;
        const matrix: string[] = Array(size * size).fill(" ");
        for (const hash of this.points) {
            const [x, y] = decode(hash);
            matrix[y * size + x] = "#";
        }
        console.info("");
        for (let y = 0; y < size; y++) {
            const rowIndex = y * size;
            const line = matrix.slice(rowIndex, rowIndex + size).join("").trimEnd();
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
        tryMatch(line, /(\d+),(\d+)/, (sx, sy) => {
            const [x, y] = [parseInt(sx), parseInt(sy)];
            this.paper.addPoint(x, y);
        }) ||
        tryMatch(line, /y=(\d+)/, (pos) => {
            this.foldInstructions.push(this.paper.foldY.bind(this.paper, parseInt(pos)));
        }) ||
        tryMatch(line, /x=(\d+)/, (pos) => {
            this.foldInstructions.push(this.paper.foldX.bind(this.paper, parseInt(pos)));
        });
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
        paper.dump();
    }
}

await Parser.run("input/13-example.txt");
await Parser.run("input/13.txt");
