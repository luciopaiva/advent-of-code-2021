
import {readLines} from "./utils";

/*
   First approach: try every model starting from 99999999999999, run the ALU code and stop when the first returns
   z == 0. To run the ALU code, I translated the input instructions into actual JavaScript code and `eval()`'ed it.

   This is what I get when I run the program:

   speed: 1.409M/s, progress: 0.00051%, ETA: 188.0 days
   speed: 1.389M/s, progress: 0.00051%, ETA: 190.6 days
   speed: 1.408M/s, progress: 0.00052%, ETA: 188.1 days

   And this is only because I improved the way I was generating the models. I was initially generating big ints and then
   converting them to string, checking if there was any 0's and splitting them and parseInt()'ing each character
   otherwise. This was the speed I was getting:

   speed: 0.571M/s, progress: 0.00000%, ETA: 463.8 days
   speed: 0.592M/s, progress: 0.00001%, ETA: 447.3 days
   speed: 0.633M/s, progress: 0.00001%, ETA: 418.3 days

   Anyway, this proves what I suspected from the beginning: this challenge is not simply about running the input
   ALU code, otherwise the result would need to be one of the first combinations for this to work.
 */

function replace(line: string, regexp: RegExp, callback): string {
    const m = line.match(regexp);
    return m && callback(...m.slice(1))
}

const time = () => Number(process.hrtime.bigint() / 1_000_000n);

class Stats {
    public round = 0;
    public total = 0;
    private nextTimeShouldReport = time() + 1000;
    private expected = 9 ** 14;
    increment(): boolean {
        this.round++;
        this.total++;
        const now = time();
        if (now > this.nextTimeShouldReport) {
            const prog = (100 * this.total / this.expected).toFixed(5);
            const seconds = (this.expected - this.total) / this.round;
            const hours = seconds / 3600;
            const days = hours / 24;
            console.info(`speed: ${(this.round/1_000_000).toFixed(3)}M/s, progress: ${prog}%, ` +
            `ETA: ${days.toFixed(1)} days`);
            this.round = 0;
            this.nextTimeShouldReport = now + 1000;
            return true;
        }
        return false;
    }
}

class Solution {
    public validateModel: (...number) => number;
    private index = 1;
    private readonly statements: string[] = [];
    private readonly rules: [RegExp, (...string) => string][] = [
        [/inp (.)/, a => `${a} = d${this.index++}`],
        [/add (.) (\S+)/, (a, b) => `${a} += ${b}`],
        [/mul (.) (\S+)/, (a, b) => `${a} *= ${b}`],
        [/div (.) (\S+)/, (a, b) => `${a} = Math.trunc(${a} / ${b})`],
        [/mod (.) (\S+)/, (a, b) => `${a} %= ${b}`],
        [/eql (.) (\S+)/, (a, b) => `${a} = ${a} === ${b} ? 1 : 0`],
    ];

    parse(line: string) {
        for (const [regexp, callback] of this.rules) {
            let statement = replace(line, regexp, callback);
            if (statement) {
                this.statements.push(statement);
                break;
            }
        }
    }

    compile() {
        const params = Array.from(Array(14), (_, k) => `d${k+1}`).join(",")
        const rules = this.statements.map(s => `${s}; `)
        const script = [`(${params}) => {`,
            // " console.info(d1, d14); process.exit(1); ",
            " let w = 0, x = 0, y = 0, z = 0;",
            ...rules,
            // "return z === 0; }",
            "return z; }",
        ].join("");
        this.validateModel = eval(script);
        // console.info(script);
    }

    *generateModels(): Generator<number[]> {
        const input = Array(14).fill(9);
        while (input[0] > 0) {
            for (let ptr = input.length - 1; ptr >= 0; ptr--) {
                input[ptr]--;
                if (input[ptr] === 0) {
                    input[ptr] = 9;
                } else {
                    break;
                }
            }
            yield input;
        }
    }

    largestValidModel(): string {
        const stats = new Stats();
        for (const modelDigits of this.generateModels()) {
            const result = this.validateModel(...modelDigits);
            const model = modelDigits.join("");
            if (stats.increment()) {
                console.info(`Latest attempt: model=${model}, result=${result}`);
            }
            if (result === 0) {
                return model;
            }
        }
    }
}

async function run(fileName: string) {
    const solution = new Solution();
    for await (const line of readLines(fileName)) {
        solution.parse(line);
    }
    solution.compile();
    console.info(`[${fileName}] largest valid model: ${solution.largestValidModel()}`);
}

await run("input/24.txt");
