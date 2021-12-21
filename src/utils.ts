
import {createReadStream} from "fs";
import * as readline from "readline";
import * as fs from "fs";

const nonBlankLinePattern = /\S/;

export async function *readLines(fileName: string, discardBlankLines = true): AsyncGenerator<string> {
    const stream = createReadStream(fileName);
    const lines = readline.createInterface({ input: stream });

    for await (const line of lines) {
        if (!discardBlankLines || nonBlankLinePattern.test(line)) {
            yield line.trim();
        }
    }
}

export function getNumberFromString(str: string): number {
    const match = str.match(/(\d+)/);
    if (match) {
        return Number(match[1]);
    }
    throw new Error(`String does not contain number: "${str}".`);
}

export function *range(from: number, to: number): Generator<number> {
    const step = Math.sign(to - from);
    for (let i = from; i !== to; i += step) {
        yield i;
    }
    yield to;
}

export function sum(numbers: number[]): number {
    return numbers.reduce((sum, n) => sum + n, 0);
}

export function readCommaSeparatedNumbersFromFile(fileName: string): number[] {
    const line = fs.readFileSync(fileName, "utf-8").split("\n")[0];
    return line.split(",").map(s => parseInt(s));
}

export class Counter<T> extends Map<T, number> {
    increment(key: T, delta: number = 1) {
        const count = this.get(key) ?? 0;
        this.set(key, count + delta);
    }

    merge(other: Counter<T>): Counter<T> {
        for (const [key, count] of other.entries()) {
            this.increment(key, count);
        }
        return this;
    }
}

export class HashMap<K, V> extends Map<K, V> {

    computeIfAbsent(key: K, callback: (k: K) => V): V {
        let value = this.get(key);
        if (value === undefined) {
            value = callback(key);
            this.set(key, value);
        }
        return value;
    }
}

export function tryMatch(text: string, regexp: RegExp, callback: (...args) => void): boolean {
    const m = text.match(regexp);
    if (m) {
        callback(...m.slice(1));
    }
    return !!m;
}

// noinspection JSSuspiciousNameCombination
export class Vector {
    constructor(public x: number, public y: number, public z: number) {
    }

    add(other: Vector): this {
        this.x += other.x;
        this.y += other.y;
        this.z += other.z;
        return this;
    }

    sub(other: Vector): this {
        this.x -= other.x;
        this.y -= other.y;
        this.z -= other.z;
        return this;
    }

    length(): number {
        return Math.hypot(this.x, this.y, this.z);
    }

    manhattan(other: Vector): number {
        return Math.abs(this.x - other.x) + Math.abs(this.y - other.y) + Math.abs(this.z - other.z);
    }

    transform(tx: (vector: Vector) => Vector): Vector {
        return tx(this);
    }

    rotateX() {
        const [y, z] = [this.y, this.z];
        this.y = z;
        this.z = -y;
        return this;
    }

    rotateY() {
        const [x, z] = [this.x, this.z];
        this.x = z;
        this.z = -x;
        return this;
    }

    rotateZ() {
        const [x, y] = [this.x, this.y];
        this.x = y;
        this.y = -x;
        return this;
    }

    invertX() {
        this.x = -this.x;
        return this;
    }

    invertY() {
        this.y = -this.y;
        return this;
    }

    invertZ() {
        this.z = -this.z;
        return this;
    }

    equals(other: Vector) {
        return this.x === other.x && this.y === other.y && this.z === other.z;
    }

    static sub(a: Vector, b: Vector): Vector {
        return new Vector(a.x - b.x, a.y - b.y, a.z - b.z);
    }

    static from(v: Vector) {
        return new Vector(v.x, v.y, v.z);
    }

    toString() {
        return `<${this.x},${this.y},${this.z}>`;
    }
}
