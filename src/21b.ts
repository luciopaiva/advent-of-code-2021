
import {Counter} from "./utils";

const MAX = 21;

interface State {
    wins1: number,
    wins2: number,
}

class Cache extends Map<string, State> {
    public cacheHits = 0;
    public cacheAccesses = 0;

    key(...args) {
        return args.map(arg => arg.toString()).join(".");
    }

    get(key: string): State {
        const value = super.get(key);
        if (value) {
            this.cacheHits++;
        }
        this.cacheAccesses++;
        return value;
    }
}
const cache = new Cache();

const diceRolls = new Counter<number>();

for (let i = 1; i < 4; i++) {
    for (let j = 1; j < 4; j++) {
        for (let k = 1; k < 4; k++) {
            diceRolls.increment(i + j + k);
        }
    }
}

const mov = (pos: number): number => pos % 10;

function round(turn: boolean, pos1: number, pos2: number, pts1: number, pts2: number): State {
    const key = cache.key(...arguments);
    const value = cache.get(key);
    if (value) {
        return value;
    }

    const result: State = {
        wins1: 0,
        wins2: 0,
    };
    cache.set(key, result);

    if (pts1 >= MAX || pts2 >= MAX) {
        // console.info(`p1:(${pos1},${pts1}) p2:(${pos2},${pts2})`);
        pts1 > pts2 ? result.wins1 = 1 : result.wins2 = 1;
        return result;
    }

    let sub;
    for (const [roll, times] of diceRolls) {
        if (turn) {
            const pos = mov(pos1 + roll);
            sub = round(!turn, pos, pos2, pts1 + pos + 1, pts2);
        } else {
            const pos = mov(pos2 + roll);
            sub = round(!turn, pos1, pos, pts1, pts2 + pos + 1);
        }
        result.wins1 += sub.wins1 * times;
        result.wins2 += sub.wins2 * times;
    }

    return result;
}

function run(name: string, pos1: number, pos2: number) {
    cache.clear();
    const result = round(true, pos1 - 1, pos2 - 1, 0, 0);
    const perc = Math.round(100 * cache.cacheHits / cache.cacheAccesses);
    console.info(`[${name}] Cache: total=${cache.cacheAccesses}, hits=${cache.cacheHits} (${perc}%)`);
    const max = Math.max(result.wins1, result.wins2);
    console.info(`[${name}] p1=${result.wins1} x p2=${result.wins2} -> ${max}`);
}

run("Example", 4, 8);
run("Part 2", 4, 5);
