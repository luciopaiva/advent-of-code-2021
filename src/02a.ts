
import {readLines, getNumberFromString} from "./utils";

const position = { x: 0, y: 0 };

for await (const line of readLines("input/02.txt")) {
    switch (line[0]) {
        case "f": position.x += getNumberFromString(line); break;
        case "d": position.y += getNumberFromString(line); break;
        case "u": position.y -= getNumberFromString(line); break;
    }
}

console.info(`x: ${position.x}`);
console.info(`y: ${position.y}`);
console.info(`Answer: ${position.x * position.y}`);
