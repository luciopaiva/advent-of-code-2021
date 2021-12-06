
import {readLines} from "./utils";

class Board {
    static SIZE = 5;
    static AREA = Board.SIZE * Board.SIZE;

    private numbersGrid: number[] = Array(Board.AREA).fill(0);
    private markingsGrid: boolean[] = Array(Board.AREA).fill(false);
    private nextPosition: number = 0;

    readLine(line: string): boolean {
        const numbers = line.trim().split(/\s+/).map(s => parseInt(s));
        for (const n of numbers) {
            this.numbersGrid[this.nextPosition++] = n;
        }
        return this.nextPosition === Board.AREA;
    }

    offer(n: number): boolean {
        for (let i = 0; i < Board.AREA; i++) {
            if (this.numbersGrid[i] === n) {
                this.markingsGrid[i] = true;
                return this.hasWinningRow(i) || this.hasWinningColumn(i);
            }
        }
        return false;
    }

    hasWinningRow(pos: number): boolean {
        const rowIndex = Math.floor(pos / Board.SIZE);
        for (let i = 0; i < Board.SIZE; i++) {
            if (this.markingsGrid[rowIndex + i] === false) {
                return false;
            }
        }
        return true;
    }

    hasWinningColumn(pos: number): boolean {
        const columnIndex = pos % Board.SIZE;
        for (let i = columnIndex; i < Board.AREA; i += Board.SIZE) {
            if (this.markingsGrid[i] === false) {
                return false;
            }
        }
        return true;
    }

    calculateScore(n: number): number {
        let sum = 0;
        for (let i = 0; i < Board.AREA; i++) {
            if (!this.markingsGrid[i]) {
                sum += this.numbersGrid[i];
            }
        }
        return sum * n;
    }

    toString(): string {
        const lines = [];
        for (let j = 0; j < Board.AREA; j += Board.SIZE) {
            let line = [];
            for (let i = 0; i < Board.SIZE; i++) {
                line.push(this.numbersGrid[j + i]);
            }
            lines.push(line.join(" "));
        }
        return lines.join("\n");
    }
}

class Solution {
    boards: Board[] = [];
    numbers: number[] = [];
    currentBoard: Board = new Board();

    async run() {
        await this.load();

        for (const n of this.numbers) {
            for (const board of this.boards) {
                if (board.offer(n)) {
                    console.info("Winning board score: " + board.calculateScore(n));
                    return;
                }
            }
        }

        console.error("Did not find a winning board!");
    }

    async load() {
        for await (const line of readLines("input/04.txt")) {
            if (this.numbers.length === 0) {
                this.numbers = line.split(",").map(s => parseInt(s))
            } else {
                if (this.currentBoard.readLine(line)) {
                    this.boards.push(this.currentBoard);
                    this.currentBoard = new Board();
                }
            }
        }
        console.info("Numbers loaded: " + this.numbers.length);
        console.info("Boards loaded: " + this.boards.length);
    }
}

(new Solution()).run().catch(console.error);
