
import {readLines} from "./utils";
import Gif from "./gif";

const LIGHT = "#";
const DARK = ".";
const BLANK = " ";
const BLANK_RE = new RegExp(BLANK, "g");
const MARGIN = 2;
const ITERATIONS_PART_1 = 2;
const ITERATIONS_PART_2 = 50;

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
        this.enhancedWidth = this.width + 2 * MARGIN;
        this.enhancedHeight = this.height + 2 * MARGIN;
        this.enhancedImage = Array.from(Array(this.enhancedHeight), () => Array(this.enhancedWidth).fill(BLANK));

        for (let x = 0; x < this.enhancedWidth; x++) {
            for (let y = 0; y < this.enhancedHeight; y++) {
                this.enhancedImage[y][x] = this.getEnhancedPixel(x - MARGIN, y - MARGIN);
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

    toBits(width: number): number[] {
        const defaultPixel = this.defaultPixel;
        const margin = Math.trunc((width - this.width) / 2);
        const emptyRow = Array(width).fill(defaultPixel === "1" ? 1 : 0);
        const topMargin = Array(margin).fill(emptyRow);
        const bottomMargin = Array(width - this.width - margin).fill(emptyRow);
        const leftMargin = Array(margin).fill(defaultPixel === "1" ? 1 : 0);
        const rightMargin = Array(width - this.width - margin).fill(defaultPixel === "1" ? 1 : 0);
        const image = this.image.map(row => row
            .map(c => c === BLANK ? defaultPixel : c)
            .map(c => (c === "1" ? 1 : 0)));
        const imageWithLateralMargins = image.map(row => leftMargin.concat(row).concat(rightMargin));
        return topMargin.concat(imageWithLateralMargins).concat(bottomMargin)
            .reduce((result, row) => result.concat(row), []);
    }

    static async run(fileName: string, wantsGif: boolean) {
        const solution = new Solution();
        const remap = line => line.replace(/\./g, "0").replace(/#/g, "1").replace(/[^01]/g, "");

        for await (const line of readLines(fileName)) {
            if (!solution.algo) {
                solution.algo = remap(line);
            } else {
                solution.addRow(remap(line));
            }
        }

        const finalWidth = solution.width + ITERATIONS_PART_2 * MARGIN * 2;
        const finalHeight = solution.height + ITERATIONS_PART_2 * MARGIN * 2;
        let gif;
        if (wantsGif) {
            gif = new Gif(finalWidth, finalHeight, 1, "day20");
            gif.addFrameNoScale(solution.toBits(finalWidth));
        }
        for (let i = 0; i < ITERATIONS_PART_2; i++) {
            if (i === ITERATIONS_PART_1) {
                console.info(`[${fileName}] pixels lit (part 1): ${solution.getPixelsLit()}`);
            }
            solution.enhance();
            wantsGif && gif.addFrameNoScale(solution.toBits(finalWidth));
        }
        console.info(`[${fileName}] pixels lit (part 2): ${solution.getPixelsLit()}`);
        wantsGif && gif.finish();
    }
}

await Solution.run("input/20-example.txt", true);
await Solution.run("input/20.txt", false);
