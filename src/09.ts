import {readLines} from "./utils";

const zero = "0".charCodeAt(0);

function calculateRisk(fileName: string, heightmap: number[][]) {
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

class BasinFinder {
    private readonly basinMap: number[][];
    private readonly basinSizes: number[];
    private readonly currentBasinId = 0;

    constructor(fileName: string, private heightmap: number[][]) {
        this.basinMap = Array.from(Array(heightmap.length), () => Array(heightmap[0].length).fill(-1));
        this.basinSizes = [0];

        for (let y = 0; y < heightmap.length; y++) {
            for (let x = 0; x < heightmap[0].length; x++) {
                if (heightmap[y][x] < 9 && this.basinMap[y][x] === -1) {
                    this.visit(x, y);
                    this.basinSizes.push(0);
                    this.currentBasinId++;
                }
            }
        }

        this.basinSizes.sort((a, b) => b - a);
        console.info(this.basinSizes);
        const result = this.basinSizes[0] * this.basinSizes[1] * this.basinSizes[2];
        console.info(`[${fileName}] 3 largest basin sizes multiplied: ${result}`);
    }

    visit(x: number, y: number) {
        this.basinMap[y][x] = this.currentBasinId;
        this.basinSizes[this.currentBasinId]++;

        y > 0 && this.heightmap[y - 1][x] < 9 && this.basinMap[y - 1][x] === -1 && this.visit(x, y - 1);
        x < this.heightmap[0].length - 1 && this.heightmap[y][x + 1] < 9 && this.basinMap[y][x + 1] === -1 && this.visit(x + 1, y);
        y < this.heightmap.length - 1 && this.heightmap[y + 1][x] < 9 && this.basinMap[y + 1][x] === -1 && this.visit(x, y + 1);
        x > 0 && this.heightmap[y][x - 1] < 9 && this.basinMap[y][x - 1] === -1 && this.visit(x - 1, y);
    }
}

async function run(fileName: string) {
    const heightmap: number[][] = [];

    for await (const line of readLines(fileName)) {
        heightmap.push([...line.trim()].map(c => c.charCodeAt(0) - zero));
    }

    calculateRisk(fileName, heightmap);
    new BasinFinder(fileName, heightmap);
}

await run("input/09-example.txt");
await run("input/09.txt");
