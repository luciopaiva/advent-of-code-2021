
import * as fs from "fs";
import Gif from "./gif";

const blankMap = (() => {
    let blankMapCache = new Map<number, string>();
    return function blankMap(width: number, height: number) {
        let map = blankMapCache.get(width);
        if (!map) {
            map = Array(height).fill(".".repeat(width)).join("\n");
            blankMapCache.set(width, map);
        }
        return map;
    }
})();

class State {
    public readonly map: string[][];
    public readonly width: number;
    public readonly height: number;
    private input: string = undefined;
    private changed = false;

    constructor(input: string) {
        this.input = input;
        this.map = input.split("\n").map(line => line.split(""));
        this.width = this.map[0].length;
        this.height = this.map.length;
    }

    equals(other: State): boolean {
        return other instanceof State && this.toString() === other.toString();
    }

    next(): State {
        const state = new State(blankMap(this.width, this.height));

        this.scan((c, x, y) => {
            if (c === ">") {
                const right = (x + 1) % this.width;
                const n = this.map[y][right];
                state.set( n === "." ? right : x, y, c);
            }
        });

        this.scan((c, x, y) => {
            if (c === "v") {
                const down = (y + 1) % this.height;
                const n1 = state.map[down][x];
                const n2 = this.map[down][x];
                state.set(x, n1 === ">" || n2 === "v" ? y : down, c);
            }
        });
        return state;
    }

    scan(rule: (c: string, x: number, y: number) => void) {
        for (let y = this.height - 1; y >= 0; y--) {
            for (let x = this.width - 1; x >= 0; x--) {
                rule(this.map[y][x], x, y);
            }
        }
    }

    *chars(): Generator<string> {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                yield this.map[y][x];
            }
        }
    }

    set(x: number, y: number, value: string) {
        this.changed = this.map[y][x] !== value;
        this.map[y][x] = value;
    }

    toString() {
        if (this.changed) {
            this.input = this.map.map(l => l.join("")).join("\n");
            this.changed = false;
        }
        return this.input;
    }
}

class Solution {
    private readonly states: State[] = [];

    constructor(private readonly initialState: State) {
        this.run();
    }

    run() {
        for (let i = 0, state = this.initialState, previous = undefined; !state.equals(previous); i++) {
            this.states.push(state);
            previous = state;
            state = state.next();
        }
    }

    stepsCount(): number {
        return this.states.length;
    }

    saveToGif() {
        const gif = new Gif(this.initialState.width, this.initialState.height, 1, "day25", 25);
        gif.palette = ["#46005b", "#007700", "#1dcb1d"].map(s => parseInt(s.substring(1) + "ff", 16));
        const xlat = { ".": 0, ">": 1, "v": 2 };
        const points = state => [...state.chars()].map(c => xlat[c]);
        for (const state of this.states) {
            gif.addFrameNoScale(points(state));
        }
        const frame = points(this.states[this.states.length - 1]);
        for (let i = 0; i < 15; i++) {
            gif.addFrameNoScale(frame);
        }
        gif.finish();
    }
}

async function run(fileName: string, wantsGif: boolean) {
    const state = new State(fs.readFileSync(fileName, "utf-8").trimEnd());
    const solution = new Solution(state);
    console.info(`[${fileName}] Number of steps until all are stopped: ${solution.stepsCount()}`);
    wantsGif && solution.saveToGif();
}

await run("input/25-example.txt", false);
await run("input/25.txt", true);
