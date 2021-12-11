
import {Counter, readLines} from "./utils";
import * as assert from "assert";

const A = 0;
const B = 1;
const C = 2;
const D = 3;
const E = 4;
const F = 5;
const G = 6;

const digitToStr = new Map<number, string>();
digitToStr.set(0b1110111, "0");
digitToStr.set(0b0010010, "1");
digitToStr.set(0b1011101, "2");
digitToStr.set(0b1011011, "3");
digitToStr.set(0b0111010, "4");
digitToStr.set(0b1101011, "5");
digitToStr.set(0b1101111, "6");
digitToStr.set(0b1010010, "7");
digitToStr.set(0b1111111, "8");
digitToStr.set(0b1111011, "9");

/**
 * Receives a ciphered digit (something like `abcf`) and returns its string representation (`0`..`9`).
 */
function decode(cipher: string, xlat: Map<string, number>): string {
    let code = 0;
    for (const char of cipher) {
        const shift = xlat.get(char);
        if (shift === undefined) {
            throw new Error(`xlat does not contain '${char}'`);
        }
        code |= 1 << (6 - shift);
    }
    const str = digitToStr.get(code);
    if (str === undefined) {
        throw new Error(`Could not decode '${code.toString(2).padStart(7, "0")}' for cipher '${cipher}'.`);
    }
    assert.ok(typeof str === "string");
    return str;
}

function buildTranslationTable(freqByCipheredSegment: Counter<string>, lengthSumByCipheredSegment: Counter<string>): Map<string, number> {
    const table = new Map<string, number>();

    for (const [segment, freq] of freqByCipheredSegment.entries()) {
        switch (freq) {
            case 4:  // e
                table.set(segment, E);
                break;
            case 6:  // b
                table.set(segment, B);
                break;
            case 9:  // f
                table.set(segment, F);
                break;
            case 7:  // d, g
                switch (lengthSumByCipheredSegment.get(segment)) {
                    case 38:  // d
                        table.set(segment, D);
                        break;
                    case 40:  // g
                        table.set(segment, G);
                        break;
                }
                break;
            case 8:  // a, c
                switch (lengthSumByCipheredSegment.get(segment)) {
                    case 43:  // a
                        table.set(segment, A);
                        break;
                    case 38:  // c
                        table.set(segment, C);
                        break;
                }
                break;
        }
    }

    return table;
}

function decipher(patterns: string[], cipher: string[]): number {

    const freqByCipheredSegment = new Counter<string>();
    const lengthSumByCipheredSegment = new Counter<string>();

    for (const pattern of patterns) {
        for (const char of pattern) {
            freqByCipheredSegment.increment(char);
            lengthSumByCipheredSegment.increment(char, pattern.length);
        }
    }

    const xlat = buildTranslationTable(freqByCipheredSegment, lengthSumByCipheredSegment);

    assert.equal(xlat.size, 7);
    return parseInt(cipher.map(c => decode(c, xlat)).join(""));
}

async function run(fileName) {
    let sum = 0;
    for await (const line of readLines(fileName)) {
        const match = line.match(/(.*)\|(.*)/);
        const patterns = match[1].trim().split(/\s+/);
        const cipher = match[2].trim().split(/\s+/);
        assert.equal(patterns.length, 10);
        assert.equal(cipher.length, 4);
        sum += decipher(patterns, cipher);
    }
    console.info(`[${fileName}] Sum: ${sum}`);
}

await run("input/08-example.txt");
await run("input/08.txt");
