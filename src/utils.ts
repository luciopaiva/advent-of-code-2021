
import {readFileSync, createReadStream} from "fs";
import * as readline from "readline";

const nonBlankLinePattern = /\S/;

export function oldreadLines(fileName: string, discardBlankLines = true): string[] {
    const rawLines = readFileSync(fileName, "utf-8").split("\n");
    return discardBlankLines ? rawLines.filter(line => nonBlankLinePattern.test(line)) : rawLines;
}

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

type LinesCallback = (lines: AsyncGenerator<string>) => void;

export async function run(callback: LinesCallback): Promise<void> {
    console.info("I'm here");
}
