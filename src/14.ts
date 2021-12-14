
import {Counter, HashMap, readLines} from "./utils";

class Solution {
    private cache: HashMap<string, Counter<string>> = new HashMap();
    private readonly empty: Counter<string> = new Counter();

    constructor(private template: string, private rules: Map<string, string>) {
    }

    grow(pair: string, step: number): Counter<string> {
        return this.cache.computeIfAbsent(pair + step, () => {
            if (step === 0) return this.empty;

            const c = this.rules.get(pair);

            const counts = new Counter<string>();
            counts.increment(c);

            const left = this.grow(pair[0] + c, step - 1);
            const right = this.grow(c + pair[1], step - 1);

            counts.merge(left);
            counts.merge(right);
            return counts;
        });
    }

    run(steps: number) {
        const frequencies: Counter<string> = new Counter();
        for (const c of this.template) {
            frequencies.increment(c);
        }

        for (let i = 0; i < this.template.length - 1; i++) {
            frequencies.merge(this.grow(this.template.slice(i, i + 2), steps));
        }

        const freqs = [...frequencies.entries()];
        freqs.sort((a, b) => a[1] - b[1]);
        let min = freqs[0][1];
        let max = freqs[freqs.length - 1][1];
        for (const [key, count] of freqs) {
            console.info(`${key}: ${count}`);
        }

        return max - min;
    }

    static async parseAndRun(fileName: string, steps: number) {
        let template = "";
        const rules = new Map();

        for await (const line of readLines(fileName)) {
            if (line.includes("->")) {
                const [pair, char] = line.trim().split(" -> ");
                rules.set(pair, char);
            } else {
                template = line;
            }
        }

        const solution = new Solution(template, rules);
        const result = solution.run(steps);
        console.info(`[${fileName}] most common - least common = ${result} (${steps} steps)`);
    }
}

await Solution.parseAndRun("input/14-example.txt", 10);
await Solution.parseAndRun("input/14.txt", 10);
await Solution.parseAndRun("input/14-example.txt", 40);
await Solution.parseAndRun("input/14.txt", 40);
