
import { readLines } from "./utils";

/*

  0:      1:      2:      3:      4:
 aaaa    ....    aaaa    aaaa    ....
b    c  .    c  .    c  .    c  b    c
b    c  .    c  .    c  .    c  b    c
 ....    ....    dddd    dddd    dddd
e    f  .    f  e    .  .    f  .    f
e    f  .    f  e    .  .    f  .    f
 gggg    ....    gggg    gggg    ....

  5:      6:      7:      8:      9:
 aaaa    aaaa    aaaa    aaaa    aaaa
b    .  b    .  .    c  b    c  b    c
b    .  b    .  .    c  b    c  b    c
 dddd    dddd    ....    dddd    dddd
.    f  e    f  .    f  e    f  .    f
.    f  e    f  .    f  e    f  .    f
 gggg    gggg    ....    gggg    gggg

Digit | n. of segments
0       6
1       2
2       5
3       5
4       4
5       5
6       6
7       3
8       7
9       6

Digits by segment count:
2: 1
3: 7
4: 4
5: 2, 3, 5
6: 0, 6, 9
7: 8

 */

const numberOfSegmentsInUniqueDigits = [2, 4, 3, 7];  // digits 1, 4, 7, 8

async function countUniqueDigits(fileName: string) {
    let uniqueDigitsCount = 0;
    for await (const line of readLines(fileName)) {
        const m = line.match(/.*\|(.*)/);
        const digits = m[1].split(/\s+/);
        uniqueDigitsCount += digits.filter(digit => numberOfSegmentsInUniqueDigits.includes(digit.length)).length;
    }

    console.info(`[${fileName}] Unique digits count (part A): `  + uniqueDigitsCount);
}

await countUniqueDigits("input/08-example.txt");
await countUniqueDigits("input/08.txt");
