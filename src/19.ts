
import {readLines, Vector} from "./utils";

const EXPECTED_BEACONS = 12;

class Beacon extends Vector {
    private readonly distancesToSiblingBeacons: number[] = [];
    // this set adds redundancy, but improves speed (and we can't just get rid of the array - we still need to know how
    // many neighbors there are - the set will merge neighbors with equal distances to us and lose information)
    private readonly distancesToSiblingBeaconsSet: Set<number> = new Set();

    addDistance(other: Beacon) {
        const distance = this.manhattan(other);
        // must round euclidean to avoid floating point imprecision
        // const distance = Math.round(Vector.sub(this, other).length());  // euclidean, also works but runs slower
        this.distancesToSiblingBeacons.push(distance);
        this.distancesToSiblingBeaconsSet.add(distance);
    }

    compare(candidate: Beacon): number {
        // how many distances both beacons have in common?
        return this.distancesToSiblingBeacons.filter(d => candidate.distancesToSiblingBeaconsSet.has(d)).length;
    }
}

interface BeaconMatch {
    myBeacon: Beacon,
    referenceBeacon: Beacon,
    score: number,
}

interface ScannerMatch {
    reference: Scanner,
    beaconMatches: BeaconMatch[],
}

class Scanner {
    public readonly beacons: Beacon[] = [];

    constructor(public readonly index: number) {
    }

    addBeacon(beacon: Beacon) {
        this.beacons.push(beacon);
    }

    computeBeaconDistances() {
        for (const beacon of this.beacons) {
            for (const other of this.beacons) {
                if (beacon !== other) {
                    beacon.addDistance(other);
                }
            }
        }
    }

    compare(refScanner: Scanner): BeaconMatch[] {
        const beaconsAndScores: BeaconMatch[] = [];

        for (const beacon of this.beacons) {
            let bestBeacon: Beacon = undefined;
            let bestScore = Number.NEGATIVE_INFINITY;

            for (const refBeacon of refScanner.beacons) {
                const score = beacon.compare(refBeacon);
                if (score > bestScore) {
                    bestScore = score;
                    bestBeacon = refBeacon;
                }
            }

            if (bestScore >= EXPECTED_BEACONS - 1) {
                beaconsAndScores.push({
                    myBeacon: beacon,
                    referenceBeacon: bestBeacon,
                    score: bestScore,
                });
            }
        }

        return beaconsAndScores;
    }

    findMatchingScanner(scanners: Scanner[]): ScannerMatch {
        for (const other of scanners) {
            if (this !== other) {
                const beaconMatches = this.compare(other);
                if (beaconMatches.length >= EXPECTED_BEACONS) {
                    return {
                        reference: other,
                        beaconMatches: beaconMatches,
                    }
                }
            }
        }
    }

    *orientations(): Generator<(Vector) => Vector> {
        // from http://www.euclideanspace.com/maths/discrete/groups/categorise/finite/cube/index.htm,
        // section "Generating rotations from i, x and y"
        yield (v: Vector) => v;
        yield (v: Vector) => v.rotateX();
        yield (v: Vector) => v.rotateY();
        yield (v: Vector) => v.rotateX().rotateX();
        yield (v: Vector) => v.rotateX().rotateY();
        yield (v: Vector) => v.rotateY().rotateX();
        yield (v: Vector) => v.rotateY().rotateY();
        yield (v: Vector) => v.rotateX().rotateX().rotateX();
        yield (v: Vector) => v.rotateX().rotateX().rotateY();
        yield (v: Vector) => v.rotateX().rotateY().rotateX();
        yield (v: Vector) => v.rotateX().rotateY().rotateY();
        yield (v: Vector) => v.rotateY().rotateX().rotateX();
        yield (v: Vector) => v.rotateY().rotateY().rotateX();
        yield (v: Vector) => v.rotateY().rotateY().rotateY();
        yield (v: Vector) => v.rotateX().rotateX().rotateX().rotateY();
        yield (v: Vector) => v.rotateX().rotateX().rotateY().rotateX();
        yield (v: Vector) => v.rotateX().rotateX().rotateY().rotateY();
        yield (v: Vector) => v.rotateX().rotateY().rotateX().rotateX();
        yield (v: Vector) => v.rotateX().rotateY().rotateY().rotateY();
        yield (v: Vector) => v.rotateY().rotateX().rotateX().rotateX();
        yield (v: Vector) => v.rotateY().rotateY().rotateY().rotateX();
        yield (v: Vector) => v.rotateX().rotateX().rotateX().rotateY().rotateX();
        yield (v: Vector) => v.rotateX().rotateY().rotateX().rotateX().rotateX();
        yield (v: Vector) => v.rotateX().rotateY().rotateY().rotateY().rotateX();
    }

    findFixedOrientationAndPosition(match: ScannerMatch) {
        const myBaseBeacon = match.beaconMatches[0].myBeacon;
        const refBaseBeacon = match.beaconMatches[0].referenceBeacon;
        console.info(`- Will use beacon ${refBaseBeacon} from scanner #${match.reference.index} with ` +
            `a score of ${match.beaconMatches[0].score} to match scanner #${this.index}'s beacon ${myBaseBeacon}`);

        for (const transform of this.orientations()) {
            const myTransformedBaseBeacon = transform(Vector.from(myBaseBeacon));
            const refTransformedBaseBeacon = Vector.from(refBaseBeacon);

            const translation = refTransformedBaseBeacon.sub(myTransformedBaseBeacon);
            const translate = (v: Vector) => v.add(translation);

            const perfectMatch = !match.beaconMatches.some(bm => {
                const transformedBeacon = translate(transform(Vector.from(bm.myBeacon)));
                return !bm.referenceBeacon.equals(transformedBeacon);
            });

            if (perfectMatch) {
                console.info(`- Found orientation! Winning translation: ${translation}`);
                this.beacons.forEach(beacon => translate(transform(beacon)));
                return;
            }
        }

        throw new Error("No valid orientations found! This was not supposed to happen 🤔");
    }

    toString() {
        return `Scanner #${this.index} [beacons=${this.beacons.length}]`;
    }
}

async function readInput(fileName: string): Promise<Scanner[]> {
    const scanners: Scanner[] = [];
    for await (const line of readLines(fileName)) {
        if (/scanner/.test(line)) {
            scanners.push(new Scanner(scanners.length));
        } else {
            const [x, y, z] = line.trim().split(",").map(s => parseInt(s));
            scanners[scanners.length - 1].addBeacon(new Beacon(x, y, z));
        }
    }
    return scanners;
}

class Solution {

    public readonly distinctBeacons = new Set<string>();
    public readonly normalizedScanners: Scanner[] = [];

    constructor(private readonly scanners: Scanner[]) {
        // quadratic on the number of beacons of each scanner (about 1000 operations per scanner)
        scanners.forEach(s => s.computeBeaconDistances());

        this.normalizedScanners = [scanners.shift()];  // the first one is our reference

        while (scanners.length > 0) {
            const scanner = scanners.shift();
            console.info(`Analyzing scanner #${scanner.index} (${scanners.length} to go)...`);
            if (this.solve(scanner)) {
                this.normalizedScanners.push(scanner);
            } else {
                scanners.push(scanner);  // move it to the end, let's try others first
            }
        }

        this.computeDistinctBeacons();
    }

    computeDistinctBeacons() {
        this.normalizedScanners.forEach(scanner => scanner.beacons.map(b => this.distinctBeacons.add(b.toString())));
    }

    solve(scanner: Scanner): boolean {
        const match = scanner.findMatchingScanner(this.normalizedScanners);

        if (match) {
            console.info(`- Scanner #${match.reference.index} is a match ` +
                `with beacon scores [${match.beaconMatches.map(p => p.score).join(",")}].`);

            scanner.findFixedOrientationAndPosition(match);
            return true;
        }

        console.info("- No matches; let's move to the next one and get back to this one later.");
        return false;
    }

    static async run(fileName: string) {
        const startTime = process.hrtime.bigint();
        const solution = new Solution(await readInput(fileName));
        const elapsed = Math.round(Number((process.hrtime.bigint() - startTime) / 1_000_000n));
        const prefix = `[${fileName}] `;
        console.info(prefix + "Total normalized scanners: " + solution.normalizedScanners.length);
        console.info(prefix + "Total distinct beacons found: " + solution.distinctBeacons.size);
        console.info(prefix + `Total elapsed time: ${elapsed} ms`);
        console.info("");
    }
}

await Solution.run("input/19-example.txt");
await Solution.run("input/19.txt");
