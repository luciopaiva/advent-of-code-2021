
import {Counter} from "./utils";

const MAX = 21;

interface State {
    wins1: number,
    wins2: number,
}

const cache = new Map<string, State>();

const diceRolls: Counter<number> = (() => {
    const result = new Counter<number>();
    for (let i = 1; i < 4; i++) {
        for (let j = 1; j < 4; j++) {
            for (let k = 1; k < 4; k++) {
                result.increment(i+j+k);
            }
        }
    }
    return result;
})();

const mov = (pos: number): number => pos % 10;

function round(turn: boolean, pos1: number, pos2: number, pts1: number, pts2: number): State {
    const key = `${turn}.${pos1}.${pos2}.${pts1}.${pts2}`;
    const value = cache.get(key);
    if (value) {
        return value;
    }

    const result: State = {
        wins1: 0,
        wins2: 0,
    };

    if (pts1 >= MAX || pts2 >= MAX) {
        // console.info(`p1:(${pos1},${pts1}) p2:(${pos2},${pts2})`);
        pts1 > pts2 ? result.wins1 = 1 : result.wins2 = 1;
        cache.set(key, {...result});
        return result;
    }

    for (const [roll, times] of diceRolls) {
        if (turn) {
            const pos = mov(pos1 + roll);
            const sub = round(!turn, pos, pos2, pts1 + pos + 1, pts2);
            result.wins1 += sub.wins1 * times;
            result.wins2 += sub.wins2 * times;
        } else {
            const pos = mov(pos2 + roll);
            const sub = round(!turn, pos1, pos, pts1, pts2 + pos + 1);
            result.wins1 += sub.wins1 * times;
            result.wins2 += sub.wins2 * times;
        }
    }

    cache.set(key, {...result});
    return result;
}

function run(name: string, pos1: number, pos2: number) {
    const result = round(true, pos1-1, pos2-1, 0, 0);
    console.info(`[${name}] ${result.wins1} x ${result.wins2} -> ${Math.max(result.wins1, result.wins2)}`);
}

run("Example", 4, 8);
run("Part 2", 4, 5);
