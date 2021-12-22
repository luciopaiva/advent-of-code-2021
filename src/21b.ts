
import {Counter} from "./utils";

const MAX = 21;

interface State {
    wins1: number,
    wins2: number,
}

const cache = new Map<string, State>();
let cacheHits = 0;
let cacheAccesses = 0;

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
    const key = `${turn}.${pos1}.${pos2}.${pts1}.${pts2}`;
    const value = cache.get(key);
    cacheAccesses++;
    if (value) {
        cacheHits++;
        return value;
    }

    const result: State = {
        wins1: 0,
        wins2: 0,
    };

    if (pts1 >= MAX || pts2 >= MAX) {
        // console.info(`p1:(${pos1},${pts1}) p2:(${pos2},${pts2})`);
        pts1 > pts2 ? result.wins1 = 1 : result.wins2 = 1;
        cache.set(key, result);
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

    cache.set(key, result);
    return result;
}

function run(name: string, pos1: number, pos2: number) {
    cacheHits = 0;
    cacheAccesses = 0;
    const result = round(true, pos1 - 1, pos2 - 1, 0, 0);
    const perc = Math.round(100 * cacheHits / cacheAccesses);
    console.info(`[${name}] Cache: total=${cacheAccesses}, hits=${cacheHits} (${perc}%)`);
    const max = Math.max(result.wins1, result.wins2);
    console.info(`[${name}] p1=${result.wins1} x p2=${result.wins2} -> ${max}`);
}

run("Example", 4, 8);
run("Part 2", 4, 5);
