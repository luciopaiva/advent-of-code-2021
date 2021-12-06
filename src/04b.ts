
import {readLines} from "./utils";

class Board {
    static SIZE = 5;
    static AREA = Board.SIZE * Board.SIZE;

    private numbersGrid: number[] = Array(Board.AREA).fill(0);
    private markingsGrid: boolean[] = Array(Board.AREA).fill(false);
    private nextPosition: number = 0;
    private won = false;

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
                this.won = this.hasWinningRow(i) || this.hasWinningColumn(i);
                return this.won;
            }
        }
        return false;
    }

    hasWon(): boolean {
        return this.won;
    }

    hasWinningRow(pos: number): boolean {
        const rowIndex = Math.floor(pos / Board.SIZE);
        for (let i = 0; i < Board.SIZE; i++) {
            if (this.markingsGrid[Board.SIZE * rowIndex + i] === false) {
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

    numbersToString(): string {
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

    markingsToString(): string {
        const lines = [];
        for (let j = 0; j < Board.AREA; j += Board.SIZE) {
            let line = [];
            for (let i = 0; i < Board.SIZE; i++) {
                line.push(this.markingsGrid[j + i] ? "x" : "_");
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

        let lastWinner: Board | undefined;
        let lastNumber = 0;

        for (const n of this.numbers) {
            console.info("The number is " + n);
            for (const board of this.boards) {
                if (!board.hasWon() && board.offer(n)) {
                    console.info("Board wins:");
                    console.info(board.numbersToString());
                    lastWinner = board;
                    lastNumber = n;
                }
                console.info(board.markingsToString());
            }
        }

        if (lastWinner instanceof Board) {
            console.info("Winning board score: " + lastWinner.calculateScore(lastNumber));
        } else {
            console.error("Did not find a winning board!");
        }
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
