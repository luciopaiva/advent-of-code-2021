
import {readFileSync} from "fs";

const nonBlankLinePattern = /\S/;

export default function readLines(fileName: string, discardBlankLines = true): string[] {
    const rawLines = readFileSync(fileName, "utf-8").split("\n");
    return discardBlankLines ? rawLines.filter(line => nonBlankLinePattern.test(line)) : rawLines;
}
