
import {createReadStream} from "fs";
import * as readline from "readline";
import * as fs from "fs";

const nonBlankLinePattern = /\S/;

export async function *readLines(fileName: string, discardBlankLines = true): AsyncGenerator<string> {
    const stream = createReadStream(fileName);
    const lines = readline.createInterface({ input: stream });

    for await (const line of lines) {
        if (!discardBlankLines || nonBlankLinePattern.test(line)) {
            yield line;
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
}
