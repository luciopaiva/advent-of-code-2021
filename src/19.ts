
import {readLines, Vector} from "./utils";

const EXPECTED_BEACONS = 12;

class Beacon extends Vector {
    private readonly distancesToSiblingBeacons: number[] = [];
    private readonly distancesToSiblingBeaconsSet: Set<number> = new Set();

    addDistance(other: Beacon) {
        const distance = this.manhattan(other);
        // const distance = Vector.sub(this, other).length();  // euclidean, also works but runs slower
        this.distancesToSiblingBeacons.push(distance);
        this.distancesToSiblingBeaconsSet.add(distance);
    }

    // scales with the number of siblings
    compare(candidate: Beacon): number {
        let score = 0;
        for (const d of this.distancesToSiblingBeacons) {
            if (candidate.distancesToSiblingBeaconsSet.has(d)) {
                score++;
            }
        }
        return score;
    }
}

interface BeaconMatch {
    myBeacon: Beacon,
    referenceBeacon: Beacon,
    score: number,
}

interface ScannerMatch {
    self: Scanner,
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

    findBestMatchingScanner(scanners: Scanner[]): ScannerMatch {
        for (const other of scanners) {
            if (this !== other) {
                const beaconMatches = this.compare(other);
                if (beaconMatches.length >= EXPECTED_BEACONS) {
                    return {
                        self: this,
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

    findFixedOrientationAndPosition(match: ScannerMatch): boolean {
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
                return true;
            }
        }

        console.info("- no valid orientations found :(");
        return false;
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

async function run(fileName: string) {
    const startTime = process.hrtime.bigint();
    const scanners = await readInput(fileName);

    // quadratic on the number of beacons of each scanner (about 1000 operations per scanner)
    scanners.forEach(s => s.computeBeaconDistances());

    const normalizedScanners: Scanner[] = [scanners.shift()];

    while (scanners.length > 0) {
        const scanner = scanners.shift();
        console.info(`Analyzing scanner #${scanner.index} (${scanners.length} to go)...`);
        const match = scanner.findBestMatchingScanner(normalizedScanners);

        if (match) {
            console.info(`- Scanner #${match.reference.index} is a match ` +
                `with beacon scores [${match.beaconMatches.map(p => p.score).join(",")}].`);

            if (scanner.findFixedOrientationAndPosition(match)) {
                normalizedScanners.push(scanner);
            } else {
                scanners.push(scanner);  // move it to the end, let's try others first
            }
        } else {
            console.info("- No matches; let's move to the next one and get back to this one later.");
            scanners.push(scanner);
        }
    }

    const beacons: Set<string> = new Set();
    normalizedScanners.forEach(scanner => scanner.beacons.map(b => beacons.add(b.toString())));

    const elapsed = Math.round(Number((process.hrtime.bigint() - startTime) / 1_000_000n));
    const prefix = `[${fileName}] `;
    console.info(prefix + "Total normalized scanners: " + normalizedScanners.length);
    console.info(prefix + "Total missing scanners: " + scanners.length);
    console.info(prefix + "Total beacons found: " + beacons.size);
    console.info(prefix + `Total elapsed time: ${elapsed} ms`);
    console.info("");
}

await run("input/19-example.txt");
await run("input/19.txt");
