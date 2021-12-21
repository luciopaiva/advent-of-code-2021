
import {readLines, sum, Vector} from "./utils";

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
    score: number,
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

            beaconsAndScores.push({
                myBeacon: beacon,
                referenceBeacon: bestBeacon,
                score: bestScore,
            });
        }
        beaconsAndScores.sort((a, b) => b.score - a.score);
        return beaconsAndScores.filter(m => m.score > 0).slice(0, 12);
    }

    findBestMatchingScanner(scanners: Scanner[]): ScannerMatch {
        let bestScannerScore = Number.NEGATIVE_INFINITY;
        let bestScanner: Scanner = undefined;
        let bestBeaconMatches: BeaconMatch[] = undefined;
        for (const other of scanners) {
            if (this !== other) {
                const beaconMatches = this.compare(other);
                const score = sum(beaconMatches.map(m => m.score));
                if (score > bestScannerScore) {
                    bestScannerScore = score;
                    bestScanner = other;
                    bestBeaconMatches = beaconMatches;
                }
            }
        }
        return {
            self: this,
            reference: bestScanner,
            beaconMatches: bestBeaconMatches,  // ToDo here we probably need to keep the best match
            score: bestScannerScore,
        }
    }

    *orientations(): Generator<(Vector) => Vector> {
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
        console.info(`Fixing scanner #${this.index}...`);
        const myBaseBeacon = match.beaconMatches[0].myBeacon;
        const refBaseBeacon = match.beaconMatches[0].referenceBeacon;
        console.info(`- will use beacon ${refBaseBeacon} from scanner ${match.reference.index} with ` +
            `a score of ${match.beaconMatches[0].score} to match my beacon ${myBaseBeacon}`);

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
                console.info(`Found orientation! Winning translation: ${translation}`);
                this.beacons.forEach(beacon => translate(transform(beacon)));
                return true;
            }
        }

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
    let tries = 75;
    while (scanners.length > 0 && tries-- > 0) {
        const scanner = scanners.shift();
        const match = scanner.findBestMatchingScanner(normalizedScanners);

        console.info(`Best match for scanner #${scanner.index} is #${match.reference.index} ` +
            `with score ${match.score} and ${match.beaconMatches.length} beacons with scores ` +
            `[${match.beaconMatches.map(p => p.score).join(",")}].`);

        if (match.beaconMatches.length < 12) {
            console.info("Partial match; let's move to the next one and get back to this one later.");
            scanners.push(scanner);
            continue;
        }

        if (scanner.findFixedOrientationAndPosition(match)) {
            normalizedScanners.push(scanner);
        } else {
            scanners.push(scanner);  // move it to the end, let's try others first
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
}

await run("input/19-example.txt");
await run("input/19.txt");
