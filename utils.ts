
import {readFileSync} from "fs";

const nonBlankLinePattern = /\S/;

export function readLines(fileName: string, discardBlankLines = true): string[] {
    const rawLines = readFileSync(fileName, "utf-8").split("\n");
    return discardBlankLines ? rawLines.filter(line => nonBlankLinePattern.test(line)) : rawLines;
}

export function getNumberFromString(str: string): number {
    const match = str.match(/(\d+)/);
    if (match) {
        return Number(match[1]);
    }
    throw new Error(`String does not contain number: "${str}".`);
}
