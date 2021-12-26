
/*
   My initial approach was to write an interpreter for the ALU instructions, but it would take forever to try all
   combinations. I then decided to actually read the code and try to make sense of it.

   The code is composed of 14 blocks like this:

    inp w
    mul x 0
    add x z
    mod x 26
    div z 1
    add x 15
    eql x w
    eql x 0
    mul y 0
    add y 25
    mul y x
    add y 1
    mul z y
    mul y 0
    add y w
    add y 15
    mul y x
    add z y

   Reconstructing the code gives this expression:

    z = (z // 1 * (25 * ((((x % 26) + 15) === w ? 1 : 0) === 0 ? 1 : 0) + 1)) + (w + 15) * ((((x % 26) + 15) === w ? 1 : 0) === 0 ? 1 : 0)

   Which becomes easier to read if we extract a variable:

    x = ((((z % 26) + 15) === w ? 1 : 0) === 0 ? 1 : 0)
    z = (z // 1 * (25 * x + 1)) + (w + 15) * x

   All other blocks follow the same pattern, but 3 values vary from block to block: the one being added in x (15), the
   one being added to w (15) and the value that divides z (1).

   At each block, the only value carried from the block that precedes it is z. Register w gets overridden by the new
   input and registers x and y are always cleared.

   Since we want z to be zero at the end of the last block, we need to somehow compensate for the ever-increasing values
   of z that can be seen as you feed digits to the input.

   By analyzing the formula, the only way z can pass to the next block as zero is if the preceding block provides a z
   value which is less than the divisor used in the current block. That value that divides z is either 1 or 26. A
   division by 1 does nothing, but a division by 26 can clear z if z is less than 26 - and that's what we want.

   If we analyze all divisors used in the code, we can see that we have 7 1's and 7 26's, and they appear in an
   arbitrary order. Since 26's are our chance to zero out z, the idea here is to end each div-by-26 block with z
   equals to zero.

   I decided to try matching div-by-1 blocks with div-by-26 ones using a stack. My idea is to keep stacking
   div-by-1 blocks until a div-by-26 is found, when then I pop a div-by-1 and try to match them.

   The idea behind matching is that whatever I feed to div-by-1 must be compensated by div-by-26. I try all combinations
   of digits, from 9 to 1 for the first part, and 1 to 9 for the second. I feed a digit to div-by-1, get its resulting
   z and use it as input to div-by-26. As soon as the first combination returns z equals to 0 after the div-by-26
   computation, I declare that pair a winning pair and save the digits as part of the result. I then continue
   navigating the stack until all pairs are matched.

   Further analysis is needed to fully understand why pairs cancel out like that, but this idea does produce the
   answers the challenge expects.
 */

import * as assert from "assert";
import {range} from "./utils";

// manually written by analyzing the input code
function compute(w: number, z: number, p1: number, p2: number, p3: number): number {
    const x = ((((z % 26) + p1) === w ? 1 : 0) === 0 ? 1 : 0);
    return (Math.trunc(z / p2) * (25 * x + 1)) + (w + p3) * x;
}

// manually extracted from the input code
const params: [number, number, number][] = [
    [15, 1, 15],
    [12, 1, 5],
    [13, 1, 6],
    [-14, 26, 7],
    [15, 1, 9],
    [-7, 26, 6],
    [14, 1, 14],
    [15, 1, 3],
    [15, 1, 1],
    [-7, 26, 3],
    [-8, 26, 4],
    [-7, 26, 6],
    [-5, 26, 7],
    [-10, 26, 1],
];

function *ascDigitPair(): Generator<[number, number]> {
    for (const d1 of range(1, 10)) {
        for (let d2 of range(1, 10)) {
            yield [d1, d2];
        }
    }
}
function *descDigitPair(): Generator<[number, number]> {
    for (const d1 of range(9, 0)) {
        for (const d2 of range(9, 0)) {
            yield [d1, d2];
        }
    }
}

function findPair(i: number, j: number, isMax: boolean): [number, number] {
    const gen = isMax ? descDigitPair : ascDigitPair;
    for (const [d1, d2] of gen()) {
        const z0 = compute(d1, 0, ...params[i]);
        const z1 = compute(d2, z0, ...params[j]);
        if (z1 === 0) {
            return [d1, d2];
        }
    }
}

function validate(...digits): boolean {
    let z = 0;
    for (let i = 0; i < params.length; i++) {
        z = compute(digits[i], z, ...params[i]);
    }
    return z === 0;
}

function matchPairs(isMax: boolean): string {
    const response = Array(14).fill(0);
    const stack = [];
    for (let i = 0; i < 14; i++) {
        if (params[i][1] === 1) {
            stack.push(i);
        } else {
            const j = stack.pop();
            const [d1, d2] = findPair(j, i, isMax);
            response[i] = d2;
            response[j] = d1;
        }
    }
    assert.ok(validate(...response));
    return response.join("");
}

console.info("Max: " + matchPairs(true));
console.info("Min: " + matchPairs(false));
