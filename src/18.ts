
import {readLines} from "./utils";

const DEBUG = false;

type Element = Pair | number;

interface Explosion {
    didExplode: boolean;
    left: number;
    right: number;
    removeChild: boolean;
}

class Pair {
    constructor(public left: Element, public right: Element) {
    }

    magnitude(): number {
        const left = this.left instanceof Pair ? this.left.magnitude() : this.left;
        const right = this.right instanceof Pair ? this.right.magnitude() : this.right;
        return 3 * left + 2 * right;
    }

    reduce(): this {
        let from, to;
        do {
            from = this.toString();
            this.reduceOnce();
            to = this.toString();
            if (from !== to) {
                DEBUG && console.info(`Reduced ${from} to ${to}`);
            }
        } while (from !== to);
        return this;
    }

    reduceOnce(): boolean {
        return this.explode(0).didExplode || this.split();
    }

    explode(lvl: number, outcome: Explosion = { didExplode: false, left: 0, right: 0, removeChild: false }): Explosion {
        if (this.left instanceof Pair && this.left.explode(lvl + 1, outcome).didExplode) {
            if (outcome.removeChild) {
                this.left = 0;
                outcome.removeChild = false;
            }
            if (outcome.right > 0) {
                if (this.right instanceof Pair) {
                    this.right.propagateLeft(outcome.right);
                } else {
                    this.right += outcome.right;
                }
                outcome.right = 0;  // consume outcome
            }
            // since we are at the leftmost node of our branch when we explode here, the left outcome propagates up
        }

        if (this.right instanceof Pair && !outcome.didExplode && this.right.explode(lvl + 1, outcome).didExplode) {
            if (outcome.removeChild) {
                this.right = 0;
                outcome.removeChild = false;
            }
            if (outcome.left > 0) {
                if (this.left instanceof Pair) {
                    this.left.propagateRight(outcome.left);
                } else {
                    this.left += outcome.left;
                }
                outcome.left = 0;
            }
            // since we are at the rightmost node of our branch when we explode here, the right outcome propagates up
        }

        if (lvl >= 4 && typeof this.left === "number" && typeof this.right === "number") {
            DEBUG && console.info(`Exploded ${this.toString()}`);
            outcome.didExplode = true;
            outcome.removeChild = true;
            outcome.left = this.left;
            outcome.right = this.right;
        }

        return outcome;
    }

    propagateLeft(value: number) {
        if (this.left instanceof Pair) {
            this.left.propagateLeft(value);
        } else {
            this.left += value;
        }
    }

    propagateRight(value: number) {
        if (this.right instanceof Pair) {
            this.right.propagateRight(value);
        } else {
            this.right += value;
        }
    }

    split(): boolean {
        if (this.left instanceof Pair && this.left.split()) {
            return true;
        } else if (typeof this.left === "number" && this.left > 9) {
            DEBUG && console.info(`Split ${this.left} in ${this.toString()}`);
            const left = Math.trunc(this.left / 2);
            this.left = new Pair(left, this.left - left);
            return true;
        } else if (this.right instanceof Pair && this.right.split()) {
            return true;
        } else if (typeof this.right === "number" && this.right > 9) {
            DEBUG && console.info(`Split ${this.right} in ${this.toString()}`);
            const left = Math.trunc(this.right / 2);
            this.right = new Pair(left, this.right - left);
            return true;
        }
        return false;
    }

    static add(left: Element, right: Element) {
        const pair = new Pair(left, right);
        return pair.reduce();
    }

    toString() {
        return `[${this.left},${this.right}]`;
    }
}

class WalkableString {
    private cursor = 0;

    constructor(private str: string) {
    }

    read(len: number = this.str.length - this.cursor): string {
        return this.str.slice(this.cursor, this.cursor += len);
    }

    peek(): string {
        return this.str[this.cursor];
    }

    match(pattern: string): string {
        const re = new RegExp("^" + pattern);
        const remaining = this.str.slice(this.cursor);
        const m = remaining.match(re);
        if (!m) {
            throw new Error(`Pattern "${pattern}" was not a match (--> "${remaining}").`);
        }
        const result = m[0];
        this.cursor += result.length;
        return result;
    }
}

class Parser {
    str: WalkableString;

    constructor(private input: string) {
        this.str = new WalkableString(input);
    }

    match(expected: string) {
        if (this.str.read(expected.length) !== expected) {
            throw new Error(`Unexpected token "${expected}" (--> "${this.str.read()}")`);
        }
    }

    element(): Element {
        if (this.str.peek() === "[") {
            return this.pair();
        } else {
            return this.literal();
        }
    }

    literal(): number {
        return parseInt(this.str.match("\\d+"))
    }

    pair(): Pair {
        this.match("[");
        const left = this.element();
        this.match(",");
        const right = this.element();
        this.match("]");
        return new Pair(left, right);
    }

    static parse(line: string): Pair {
        const p = new Parser(line);
        return p.pair();
    }
}

async function run(fileName: string) {
    const pairs: Pair[] = [];
    for await (const line of readLines(fileName)) {
        const pair = Parser.parse(line.replace(/[^\[\]0-9,]/g, ""));
        pairs.push(pair);
    }
    const root = pairs.reduce((l, r) => l ? Pair.add(l, r) : r);
    console.info(`[${fileName}] Reduction: ${root.toString()}`);
    console.info(`[${fileName}] Magnitude: ${root.magnitude()}`);
}

await run("input/18-example.txt");
await run("input/18.txt");
