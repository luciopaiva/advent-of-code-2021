
import {readLines} from "./utils";

class Solution {
    private stack: string[] = [];

    computeScore(line: string): number {
        for (const c of line.trim()) {
            const score = this.checkCharacter(c);
            if (score > 0) {
                return score;
            }
        }
        return 0;
    }

    checkCharacter(c: string): number {
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
                    return 3;
                }
                break;
            case "]":
                if (this.stack.pop() !== "]") {
                    return 57;
                }
                break;
            case "}":
                if (this.stack.pop() !== "}") {
                    return 1197;
                }
                break;
            case ">":
                if (this.stack.pop() !== ">") {
                    return 25137;
                }
                break;
        }
        return 0;
    }
}

async function run(fileName: string) {
    let score = 0;


    for await (const line of readLines(fileName)) {
        const solution = new Solution();
        score += solution.computeScore(line.trim());
    }

    console.info(`[${fileName}] score: ${score}`);
}

await run("input/10-example.txt");
await run("input/10.txt");
