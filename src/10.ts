
import {readLines} from "./utils";

class Solution {
    private stack: string[] = [];
    public score = 0;
    public isCorrupted = false;

    computeScore(line: string) {
        for (const c of line.trim()) {
            if (!this.checkCharacter(c)) {
                break;
            }
        }

        if (!this.isCorrupted) {
            this.computeIncompleteScore();
        }
    }

    computeIncompleteScore() {
        for (const c of this.stack.reverse()) {
            switch (c) {
                case ")": this.score = this.score * 5 + 1; break;
                case "]": this.score = this.score * 5 + 2; break;
                case "}": this.score = this.score * 5 + 3; break;
                case ">": this.score = this.score * 5 + 4; break;
            }
        }
    }

    checkCharacter(c: string): boolean {
        switch (c) {
            case "(":
                this.stack.push(")");
                break;
            case "[":
                this.stack.push("]");
                break;
            case "{":
                this.stack.push("}");
                break;
            case "<":
                this.stack.push(">");
                break;
            case ")":
                if (this.stack.pop() !== ")") {
                    this.score = 3;
                    this.isCorrupted = true;
                    return false;
                }
                break;
            case "]":
                if (this.stack.pop() !== "]") {
                    this.score = 57;
                    this.isCorrupted = true;
                    return false;
                }
                break;
            case "}":
                if (this.stack.pop() !== "}") {
                    this.score = 1197;
                    this.isCorrupted = true;
                    return false;
                }
                break;
            case ">":
                if (this.stack.pop() !== ">") {
                    this.score = 25137;
                    this.isCorrupted = true;
                    return false;
                }
                break;
        }
        return true;
    }
}

async function run(fileName: string) {
    let corruptedScore = 0;
    let incompleteScores: number[] = [];

    for await (const line of readLines(fileName)) {
        const solution = new Solution();
        solution.computeScore(line.trim());
        if (solution.isCorrupted) {
            corruptedScore += solution.score;
        } else {
            incompleteScores.push(solution.score);
        }
    }

    incompleteScores.sort((a, b) => a - b);

    const incompleteScore = incompleteScores[Math.floor(incompleteScores.length / 2)];

    console.info(`[${fileName}] corrupted score: ${corruptedScore}`);
    console.info(`[${fileName}] incomplete score: ${incompleteScore}`);
}

await run("input/10-example.txt");
await run("input/10.txt");
