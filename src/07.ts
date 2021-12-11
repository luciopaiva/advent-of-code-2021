
import {readCommaSeparatedNumbersFromFile, sum} from "./utils";

abstract class Solution {
    public optimalPosition: number;
    public totalFuel: number;

    constructor(protected submarines: number[]) {
        this.findOptimalPosition();
        this.totalFuel = this.computeTotalFuelForPosition(this.optimalPosition);
    }

    abstract computeTotalFuelForPosition(position: number);
    abstract findOptimalPosition();
}

class SolutionA extends Solution {
    findOptimalPosition() {
        this.submarines.sort((a, b) => a - b);
        this.optimalPosition = this.submarines[Math.round(this.submarines.length / 2)];
    }

    computeTotalFuelForPosition(position: number) {
        return sum(this.submarines.map(p => Math.abs(p - position)));
    }
}

function findMinimum(positions: number[], left: number, right: number, weight: (number) => number): number {
    const leftWeight = weight(left);
    const rightWeight = weight(right);

    if (right - left <= 1) {
        return leftWeight < rightWeight ? left : right;
    }

    const middle = Math.round(left + (right - left) / 2);

    if (leftWeight > rightWeight) {
        return findMinimum(positions, middle, right, weight);
    } else {
        return findMinimum(positions, left, middle, weight);
    }
}

class SolutionB extends Solution {
    findOptimalPosition() {
        this.optimalPosition = findMinimum(this.submarines, 0, this.submarines.length - 1,
            this.computeTotalFuelForPosition.bind(this));
    }

    computeTotalFuelForPosition(position: number) {
        return sum(this.submarines.map(p => {
            const n = Math.abs(p - position);
            return n * (n + 1) / 2;
        }));
    }
}

function computeFuelNeeded(fileName: string) {
    const submarines = readCommaSeparatedNumbersFromFile(fileName);
    const solutionA = new SolutionA(submarines);
    const solutionB = new SolutionB(submarines);

    console.info(`Fuel needed for input ` +
        `"${fileName}", part A: ${solutionA.totalFuel} (position=${solutionA.optimalPosition})`);
    console.info(`Fuel needed for input ` +
        `"${fileName}", part B: ${solutionB.totalFuel} (position=${solutionB.optimalPosition})`);
}

computeFuelNeeded("input/07-example.txt");
computeFuelNeeded("input/07.txt");
