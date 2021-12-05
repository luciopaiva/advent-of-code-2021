
import {readLines, getNumberFromString} from "./utils";

const state = { x: 0, y: 0, aim: 0 };

function handleForward(line: string) {
    const value = getNumberFromString(line);
    state.x += value;
    state.y += state.aim * value;
}

for await (const line of readLines("input/02.txt")) {
    switch (line[0]) {
        case "f": handleForward(line); break;
        case "d": state.aim += getNumberFromString(line); break;
        case "u": state.aim -= getNumberFromString(line); break;
    }
}

console.info(`x: ${state.x}`);
console.info(`y: ${state.y}`);
console.info(`Answer: ${state.x * state.y}`);
