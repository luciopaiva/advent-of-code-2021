
import {readLines} from "./utils";

let bits = [];

for await (const line of readLines("input/03.txt")) {
    if (bits.length === 0) {
        bits = new Array(line.length);
        bits.fill(0);
    }

    for (let i = 0; i < line.length; i++) {
        bits[i] += line[i] === "1" ? 1 : -1;
    }
}

let gamma = 0;
for (const bit of bits) {
    gamma = gamma << 1 | (bit > 0 ? 1 : 0);
}

const epsilon = ~gamma & ((1 << bits.length) - 1);

console.info(`Bits: [${bits.join(", ")}]`);
console.info("Gamma: " + gamma);
console.info("Epsilon: " + epsilon);
console.info("Multiplication: " + (gamma * epsilon));
