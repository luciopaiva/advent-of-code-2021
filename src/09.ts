import {readLines} from "./utils";

const zero = "0".charCodeAt(0);

async function run(fileName: string) {
    const heightmap: number[][] = [];

    for await (const line of readLines(fileName)) {
        heightmap.push([...line.trim()].map(c => c.charCodeAt(0) - zero));
    }

    let totalRisk = 0;
    for (let row = 0; row < heightmap.length; row++) {
        for (let col = 0; col < heightmap[0].length; col++) {
            const height = heightmap[row][col];
            if (
                (row === 0 || heightmap[row - 1][col] > height) &&  // top
                (col + 1 === heightmap[0].length || heightmap[row][col + 1] > height) &&  // right
                (row + 1 === heightmap.length || heightmap[row + 1][col] > height) && // bottom
                (col === 0 || heightmap[row][col - 1] > height)) {  // left
                totalRisk += height + 1;
            }

        }
    }

    console.info(`[${fileName}] risk: ${totalRisk}`);
}

await run("input/09-example.txt");
await run("input/09.txt");
