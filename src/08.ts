import {readLines} from "./utils";

const numberOfSegmentsInUniqueDigits = [2, 4, 3, 7];  // digits 1, 4, 7, 8

async function countUniqueDigits(fileName: string) {
    let uniqueDigitsCount = 0;
    for await (const line of readLines(fileName)) {
        const m = line.match(/.*\|(.*)/);
        const digits = m[1].split(/\s+/);
        uniqueDigitsCount += digits.filter(digit => numberOfSegmentsInUniqueDigits.includes(digit.length)).length;
    }

    console.info(uniqueDigitsCount);
}

await countUniqueDigits("input/08-example.txt");
await countUniqueDigits("input/08.txt");
