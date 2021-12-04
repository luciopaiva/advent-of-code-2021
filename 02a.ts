
import readLines from "./util/text-file";

const lines = readLines("input/02.txt");

const position = { x: 0, y: 0 };

function getNumber(str: string): number {
    const match = str.match(/(\d+)/);
    if (match) {
        return Number(match[1]);
    }
    throw new Error(`String does not contain number: "${str}".`);
}

for (const line of lines) {
    switch (line[0]) {
        case "f": position.x += getNumber(line); break;
        case "d": position.y += getNumber(line); break;
        case "u": position.y -= getNumber(line); break;
    }
}

console.info(`x: ${position.x}`);
console.info(`y: ${position.y}`);
console.info(`Answer: ${position.x * position.y}`);
