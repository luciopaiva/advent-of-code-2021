
import * as fs from "fs";

/*
My first implementation used Dijkstra. Starting with the initial state, the algorithm computed every possible movement
from it; these were the "neighbors" of the initial state. Then, for each neighbor, its score is computed and used to
sort them to figure out which state to open visit next.

This was initially taking more than 73 minutes to run (part 1) because it was sorting the queue on every visit. I did a
small optimization to only sort if something was actually added to the queue during each visit, and another one to sort
states that were a tie based on their organization scores (i.e., how many amphipods were inside their destination
rooms), so that more organized states were visited first. These two optimizations dropped the running time to 51 min.

Finally, I decided to go with A*, using the sum of the Manhattan distances of every amphipod not in its final room as
heuristic. This dropped the running time to 2 min. That was when I finally got to try part 2, which also run in 2 min.
 */

const WALL = "#";
const ROOMS = "abcd".split("");
const MANEUVER_SPOT = "x";
const SPACE = ".";
const PASSABLE = [...ROOMS, MANEUVER_SPOT, SPACE];
const PODS = "ABCD".split("");
const COST_BY_TYPE = { "A": 1, "B": 10, "C": 100, "D": 1000 };

class Point {
    constructor(public x: number, public y: number) {
    }

    hash(): number {
        return this.x << 16 | this.y;
    }

    manhattan(other: Point): number {
        return Math.abs(other.x - this.x) + Math.abs(other.y - this.y);
    }
}

class Pod extends Point {
    constructor(public readonly label: string, x: number, y: number, public readonly cost: number = 0) {
        super(x, y);
    }

    toString() {
        return `${this.label}<${this.x},${this.y}>`;
    }

    *movements(): Generator<Pod> {
        const cost = COST_BY_TYPE[this.label];
        yield new Pod(this.label, this.x, this.y - 1, this.cost + cost);
        yield new Pod(this.label, this.x + 1, this.y, this.cost + cost);
        yield this.down();
        yield new Pod(this.label, this.x - 1, this.y, this.cost + cost);
    }

    down(): Pod {
        return new Pod(this.label, this.x, this.y + 1, this.cost + COST_BY_TYPE[this.label]);
    }

    manhattan(other: Point): number {
        return COST_BY_TYPE[this.label] * super.manhattan(other);
    }
}

class State {
    private strRep: string;
    public organizationScore = 0;
    public heuristicScore = 0;
    public totalScore = 0;

    constructor(private readonly map: string[],
                public readonly score: number = 0,
                public readonly previous: State = undefined) {
        this.recomputeRepresentation();
    }

    *pods(): Generator<Pod> {
        for (let y = 0; y < this.map.length; y++) {
            for (let x = 0; x < this.map[y].length; x++) {
                const c = this.map[y][x];
                if (PODS.includes(c)) {
                    yield new Pod(c, x, y);
                }
            }
        }
    }

    *rooms(): Generator<Pod> {
        for (let y = 0; y < this.map.length; y++) {
            for (let x = 0; x < this.map[y].length; x++) {
                const c = this.map[y][x];
                if (ROOMS.includes(c)) {
                    yield new Pod(c, x, y);
                }
            }
        }
    }

    get(point: Point): string {
        return this.map[point.y][point.x];
    }

    set(point: Point, value: string) {
        this.map[point.y] = this.map[point.y].substring(0, point.x) + value + this.map[point.y].substring(point.x + 1);
        this.recomputeRepresentation();
    }

    recomputeRepresentation() {
        this.strRep = this.map.join("\n");
    }

    toString(): string {
        return `${this.strRep.trimEnd()}    score: ${this.score}\n`;
    }

    static from(state: State, score = 0) {
        return new State([...state.map], score, state);
    }
}

class Game {
    private readonly roomPositions: [Pod, string][] = [];
    private readonly roomEntryPoints: Map<string, Pod> = new Map();
    private bestOrganizationScoreSoFar = Number.NEGATIVE_INFINITY;
    private bestOrganizationStateSoFar: State = undefined;
    private readonly finalOrganizationScore;

    constructor(private readonly map: State, private readonly start: State) {
        this.finalOrganizationScore = [...this.map.rooms()].length;
        this.cacheRoomPositions();
        this.cacheRoomEntryPoints();
    }

    /**
     * Here each amphipod goes through a breadth-first search to find its next possible positions. For each valid global
     * state, this method yields one result. Next possible positions are DESTINATIONS
     * @param state
     */
    *neighbors(state: State): Generator<State> {
        for (const pod of state.pods()) {
            if (this.isPodSettled(pod, state)) {
                continue;
            }

            const queue: Pod[] = [pod];
            const visited = new Set<number>();

            while (queue.length > 0) {
                const candidateDestination = queue.shift();
                visited.add(candidateDestination.hash());

                if (this.isPodAtValidDestination(pod, candidateDestination, state)) {
                    yield this.move(pod, candidateDestination, state);
                }

                for (const position of candidateDestination.movements()) {
                    if (PASSABLE.includes(state.get(position)) && !visited.has(position.hash())) {
                        queue.push(position);
                    }
                }
            }
        }
    }

    // an amphipod is settled iff all positions below it that are part of its room are occupied only by its siblings
    isPodSettled(pod: Pod, state: State): boolean {
        if (!this.isPodInRoom(pod)) {
            return false;
        }
        for (let pos = pod; state.get(pos) !== WALL; pos = pos.down()) {
            if (state.get(pos) !== pod.label) {
                return false;
            }
        }
        return true;
    }

    isPodInRoom(pod: Pod): boolean {
        return this.isValidRoom(pod.label, this.map.get(pod));
    }

    isPodAtValidDestination(pod: Pod, candidateDestination: Pod, state: State): boolean {
        if (!PASSABLE.includes(state.get(candidateDestination))) {
            // candidate is already occupied by something else
            return false;
        }

        const originalPosition = this.map.get(pod);
        const candidatePosition = this.map.get(candidateDestination);
        if (ROOMS.includes(originalPosition)) {
            // if pod came from a room, valid destinations are maneuver spots
            return candidatePosition === MANEUVER_SPOT;
        } else if (originalPosition === MANEUVER_SPOT) {
            // if pod came from a maneuver spot, valid destinations are their specific rooms, specifically the
            // bottom-most slot in the room (we don't want to stop in the middle of it), but only if there
            // aren't other pod types in there
            if (this.isValidRoom(pod.label, candidatePosition)) {
                if (state.get(candidateDestination.down()) !== SPACE) {
                    if (this.isRoomClearOfIntruders(pod, candidateDestination, state)) {
                        return true;
                    }
                }
            }
            return false;
        }
    }

    isValidRoom(podType: string, positionType: string): boolean {
        return podType.toLocaleLowerCase() === positionType;
    }

    isRoomClearOfIntruders(pod: Pod, room: Pod, state: State): boolean {
        const queue: Pod[] = [room];
        const visited = new Set<number>();
        while (queue.length > 0) {
            const pos = queue.shift();
            visited.add(pos.hash());

            if (![pod.label, SPACE].includes(state.get(pos))) {
                return false;  // there's an intruder in the room, so we can't move in
            }

            for (const neighbor of pos.movements()) {
                if (this.isValidRoom(pod.label, this.map.get(neighbor)) && !visited.has(neighbor.hash())) {
                    queue.push(neighbor);
                }
            }
        }

        return true;  // the room is free of intruders, so it's ok to enter it
    }

    move(pod: Pod, destination: Pod, oldState: State) {
        const newState = State.from(oldState, oldState.score + destination.cost);
        newState.set(destination, pod.label);
        newState.set(pod, SPACE);
        return newState;
    }

    run(): number {
        const queue: State[] = [this.start];
        const visited = new Set<string>();
        const opened = new Map<string, State>();

        let end: State;
        while (queue.length > 0) {
            const state = queue.pop();

            if (this.checkBest(state)) {
                end = state;
                break;
            }

            opened.delete(state.toString());
            visited.add(state.toString());

            let mustRefreshQueue = false;
            for (const next of this.neighbors(state)) {
                if (!visited.has(next.toString())) {
                    const existing = opened.get(next.toString());
                    if (!existing || next.score < existing.score) {
                        this.computeOrganizationScore(next);
                        this.computeHeuristicScore(next);
                        opened.set(next.toString(), next);
                        queue.push(next);
                        mustRefreshQueue = true;
                    }
                }
            }

            if (mustRefreshQueue) {
                queue.sort((a, b) => b.totalScore - a.totalScore);
            }
        }

        if (end) {
            this.dump(end);
        } else {
            throw new Error(`Path not found! Visited states: ${visited.size}`);
        }

        return end?.score;
    }

    checkBest(state: State) {
        if (state.organizationScore > this.bestOrganizationScoreSoFar) {
            this.bestOrganizationScoreSoFar = state.organizationScore;
            this.bestOrganizationStateSoFar = state;
            console.info(state.toString());
        }
        return state.organizationScore === this.finalOrganizationScore;
    }

    computeOrganizationScore(state: State) {
        state.organizationScore = 0;
        for (const [room, type] of this.roomPositions) {
            if (state.get(room) === type) {
                state.organizationScore++;
            }
        }
    }

    /**
     * The heuristic is basically the Manhattan distance of every pod to its respective room's entry point. The entry
     * point is used just to simplify the computation, and it works fine because it will never overestimate. Pods inside
     * its rooms doesn't add any costs.
     */
    computeHeuristicScore(state: State) {
        state.heuristicScore = 0;
        for (const pod of state.pods()) {
            if (!this.isPodInRoom(pod)) {
                const roomType = pod.label.toLowerCase();
                const entry = this.roomEntryPoints.get(roomType);
                state.heuristicScore += pod.manhattan(entry);
            }
        }
        state.totalScore = state.score + state.heuristicScore;
    }

    cacheRoomPositions() {
        for (const room of this.map.rooms()) {
            this.roomPositions.push([room, room.label.toUpperCase()]);
        }
    }

    cacheRoomEntryPoints() {
        for (const room of this.map.rooms()) {
            // assumes entry points are always the first room spots found
            if (!this.roomEntryPoints.has(room.label)) {
                this.roomEntryPoints.set(room.label, room);
            }
        }
    }

    dumpStatePair(left: State, right: State) {
        const leftLines = left.toString().split("\n")
        const rightLines = right.toString().split("\n")
        for (let i = 0; i < leftLines.length; i++) {
            console.info(leftLines[i].padEnd(20) + rightLines[i]);
        }
        console.info("");
    }

    dump(end: State) {
        const steps: State[] = [end];
        while (end.previous) {
            steps.push(end.previous);
            end = end.previous;
        }
        steps.reverse();
        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            console.info(`Step ${i} ---- score: ${step.score} ------`);
            console.info(step.toString());
        }
    }
}

function run(fileName: string) {
    const startTime = process.hrtime.bigint();
    const [map, start] = fs.readFileSync(fileName, "utf-8").split("\n\n")
        .map(m => m.split("\n"));

    const game = new Game(new State(map), new State(start));

    console.info(`[${fileName}] Least energy required: ${game.run()}`)
    const elapsed = (process.hrtime.bigint() - startTime) / 1_000_000n;
    console.info(`[${fileName}] Took ${elapsed} ms`)
}

/*
   Expect this to take some time. Both part 1 and part 2 take about 2 min to run each.
 */
run("input/23.txt");
run("input/23-part2.txt");
