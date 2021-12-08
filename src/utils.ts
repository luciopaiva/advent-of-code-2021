
import {createReadStream} from "fs";
import * as readline from "readline";

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
