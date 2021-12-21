import {readLines} from "./utils";

const LIGHT = "#";
const DARK = ".";
const BLANK = " ";
const BLANK_RE = new RegExp(BLANK, "g");

class Solution {

    private algo: string = "";
    private image: string[][] = [];
    private width = 0;
    private height = 0;
    private enhancedImage: string[][] = [];
    private enhancedWidth = 0;
    private enhancedHeight = 0;
    private defaultPixel: string = "0";

    addRow(row: string) {
        this.image.push(row.split(""));
        this.width = row.length;
        this.height = this.image.length;
    }

    enhance() {
        const margin = 2;

        this.enhancedWidth = this.width + 2 * margin;
        this.enhancedHeight = this.height + 2 * margin;
        this.enhancedImage = Array.from(Array(this.enhancedHeight), () => Array(this.enhancedWidth).fill(BLANK));

        for (let x = 0; x < this.enhancedWidth; x++) {
            for (let y = 0; y < this.enhancedHeight; y++) {
                this.enhancedImage[y][x] = this.getEnhancedPixel(x - margin, y - margin);
            }
        }

        this.image = this.enhancedImage;
        this.width = this.enhancedWidth;
        this.height = this.enhancedHeight;
        this.defaultPixel = this.enhance3x3(this.defaultPixel.repeat(9));
    }

    getEnhancedPixel(x: number, y: number): string {
        return this.enhance3x3([
            this.getPixel(x - 1, y - 1),
            this.getPixel(x, y - 1),
            this.getPixel(x + 1, y - 1),
            this.getPixel(x - 1, y),
            this.getPixel(x, y),
            this.getPixel(x + 1, y),
            this.getPixel(x - 1, y + 1),
            this.getPixel(x, y + 1),
            this.getPixel(x + 1, y + 1),
        ].join(""));
    }

    getPixel(x: number, y: number) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return this.defaultPixel;
        }
        return this.image[y][x];
    }

    enhance3x3(grid: string): string {
        return this.algo[parseInt(grid, 2)];
    }

    getPixelsLit(): number {
        return this.image.map(line => line.join("")).join("")
            .replace(BLANK_RE, this.defaultPixel)
            .replace(/[^1]/g, "").length;
    }

    snapshot() {
        return this.image.map(line => line.join("")
            .replace(BLANK_RE, this.defaultPixel)
            .replace(/0/g, DARK)
            .replace(/1/g, LIGHT)
        ).join("\n") + "\n";
    }

    static async run(fileName: string) {
        const solution = new Solution();
        const remap = line => line.replace(/\./g, "0").replace(/#/g, "1").replace(/[^01]/g, "");

        for await (const line of readLines(fileName)) {
            if (!solution.algo) {
                solution.algo = remap(line);
            } else {
                solution.addRow(remap(line));
            }
        }

        for (let i = 0; i < 50; i++) {
            solution.enhance();
            if (i === 1) {
                console.info(`[${fileName}] pixels lit (part 1): ${solution.getPixelsLit()}`);
            }
        }
        console.info(`[${fileName}] pixels lit (part 2): ${solution.getPixelsLit()}`);
    }
}

await Solution.run("input/20-example.txt");
await Solution.run("input/20.txt");
