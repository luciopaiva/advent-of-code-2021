
import {readLines, Vector} from "./utils";

class Beacon extends Vector {
    private readonly distanceToOtherBeacons: Set<number> = new Set();

    addDistance(other: Beacon) {
        this.distanceToOtherBeacons.add(Vector.sub(this, other).length());
    }

    compare(candidate: Beacon): number {
        let score = 0;
        for (const d of this.distanceToOtherBeacons) {
            if (candidate.distanceToOtherBeacons.has(d)) {
                score++;
            }
        }
        return score;
    }

    findBestMatchingBeacon(scanner: Scanner): [Beacon, number] {
        let bestBeacon: Beacon = undefined;
        let bestScore = Number.NEGATIVE_INFINITY;
        for (const beacon of scanner.beacons) {
            const score = this.compare(beacon);
            if (score > bestScore) {
                bestScore = score;
                bestBeacon = beacon;
            }
        }
        return [bestBeacon, bestScore];
    }
}

interface BeaconMatch {
    myBeacon: Beacon,
    referenceBeacon: Beacon,
    score: number,
}

interface ScannerMatch {
    self: Scanner,
    match: Scanner,
    beaconMatches: BeaconMatch[],
    score: number,
}

class Scanner {
    public readonly beacons: Beacon[] = [];
    // public readonly distances: Set<number> = new Set();

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
        // this.distances.clear();
        // for (let i = 0; i < this.beacons.length; i++) {
        //     for (let j = i + 1; j < this.beacons.length; j++) {
        //         this.distances.add(Vector.sub(this.beacons[i], this.beacons[j]).length());
        //     }
        // }
    }

    // compareOld(other: Scanner) {
    //     let matches = 0;
    //     for (const distance of this.distances) {
    //         if (other.distances.has(distance)) {
    //             matches++;
    //         }
    //     }
    //     return matches;
    // }

    compare(otherScanner: Scanner): [number, BeaconMatch[]] {
        let total = 0;
        const beaconsAndScores: BeaconMatch[] = [];
        for (const beacon of this.beacons) {
            const [otherBeacon, score] = beacon.findBestMatchingBeacon(otherScanner);
            total += score;
            beaconsAndScores.push({
                myBeacon: beacon,
                referenceBeacon: otherBeacon,
                score: score,
            });
        }
        beaconsAndScores.sort((a, b) => b.score - a.score);
        return [total, beaconsAndScores.slice(0, 12)];
    }

    findBestScannerWithScore(scanners: Scanner[]): ScannerMatch {
        let bestScannerScore = Number.NEGATIVE_INFINITY;
        let bestScanner: Scanner = undefined;
        let bestBeaconMatches: BeaconMatch[] = undefined;
        for (const other of scanners) {
            if (this !== other) {
                const [score, beaconMatches] = this.compare(other);
                if (score > bestScannerScore) {
                    bestScannerScore = score;
                    bestScanner = other;
                    bestBeaconMatches = beaconMatches;
                }
            }
        }
        return {
            self: this,
            match: bestScanner,
            beaconMatches: bestBeaconMatches,
            score: bestScannerScore,
        }
    }

    fixOrientationAndPosition(match: ScannerMatch) {
        console.info(`Fixing scanner ${this.index}...`);
        const myBeacon = match.beaconMatches[0].myBeacon.toString();
        const refBeacon = match.beaconMatches[0].referenceBeacon.toString();
        console.info(`- will use beacon ${refBeacon} from scanner ${match.match.index} with ` +
            `a score of ${match.beaconMatches[0].score}`);

        // ToDo rotate my beacon in all 24 possible ways
        // ToDo   translate it so it matches ref beacon
        // ToDo   go through all beacons and see how many match - if more than 12, accept rotation and translation
    }

    toString() {
        // return `Scanner #${this.index} [beacons=${this.beacons.length}, distances=${this.distances.size}]`;
        return `Scanner #${this.index} [beacons=${this.beacons.length}]`;
    }
}

async function run(fileName: string) {
    const scanners: Scanner[] = [];
    for await (const line of readLines(fileName)) {
        if (/scanner/.test(line)) {
            scanners.push(new Scanner(scanners.length));
        } else {
            const [x, y, z] = line.trim().split(",").map(s => parseInt(s));
            scanners[scanners.length - 1].addBeacon(new Beacon(x, y, z));
        }
    }

    scanners.forEach(s => s.computeBeaconDistances());

    const normalizedScanners: Scanner[] = [scanners.shift()];
    for (const scanner of scanners) {
        // const [bestScanner, bestScore, bestBeaconsAndScores] = scanner.findBestScannerWithScore(normalizedScanners);
        const match = scanner.findBestScannerWithScore(normalizedScanners);
        console.info(`Best match for scanner #${scanner.index} is #${match.match.index} ` +
            `with score ${match.score} and beacon scores [${match.beaconMatches.map(p => p.score).join(",")}].`);

        scanner.fixOrientationAndPosition(match);
    }

    // for (let i = 0; i < scanners.length - 1; i++) {
    //     const [bestScanner, bestScore] = scanners[i].findBestScannerWithScore(scanners);
    //     let bestScore = Number.NEGATIVE_INFINITY;
    //     let bestScanner = -1;
    //     for (let j = i + 1; j < scanners.length; j++) {
    //         const score = scanners[i].compare(scanners[j]);
    //         if (score > bestScore) {
    //             bestScore = score;
    //             bestScanner = j;
    //         }
    //     }
    //     console.info(`Best match for scanner #${i} is #${bestScanner} with score ${bestScore}.`);
    // }

    // for (const left )
    //
    // const left = scanners[0];
    // const right = scanners[1];
    // const uniqueBeacons = [];
    //
    // for (let i = 0; i < left.beacons.length; i++) {
    //     const beacon = left.beacons[i];
    //
    //     const scores = [];
    //     // console.info(`- looking into scanner 1`);
    //     for (const other of right.beacons) {
    //         scores.push([other, beacon.compare(other)]);
    //     }
    //     scores.sort((a, b) => b[1] - a[1]);
    //     console.info(`Scanner 0, beacon ${i} - search in scanner 1 found possible match with score ${scores[0][1]}`);
    //     console.info(beacon + " " + scores[0][0]);
    // }

    // for (const scanner of scanners) {
    //     for (const distance of scanner.distances) {
    //         // unique.add(Math.round(distance));
    //         unique.add(distance);
    //     }
    // }
}

await run("input/19-example.txt");
