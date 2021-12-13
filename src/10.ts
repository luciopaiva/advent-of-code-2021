
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
            // compute incomplete score
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
    let corruptionScore = 0;

    for await (const line of readLines(fileName)) {
        const solution = new Solution();
        solution.computeScore(line.trim());
        if (solution.isCorrupted) {
            corruptionScore += solution.score;
        }
    }

    console.info(`[${fileName}] corruption score: ${corruptionScore}`);
}

await run("input/10-example.txt");
await run("input/10.txt");
