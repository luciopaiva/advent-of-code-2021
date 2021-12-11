
import {readCommaSeparatedNumbersFromFile, sum} from "./utils";

const TOTAL_DAYS = 256;
const INITIAL_GROWTH_PERIOD = 9;
const TOTAL_DAYS_TO_SIMULATE = TOTAL_DAYS + INITIAL_GROWTH_PERIOD;
const GROWTH_PERIOD = 7;

class Simulation {
    schoolSizeInDays: number[];

    constructor() {
        this.computeOffspringSingleFish();
    }

    dumpSingleFish() {
        console.info("Growth of a single fish: " + this.schoolSizeInDays.map(size => String(size)).join(", "));
    }

    computeOffspringSingleFish() {
        this.schoolSizeInDays = new Array(TOTAL_DAYS_TO_SIMULATE);

        for (let i = 0; i < INITIAL_GROWTH_PERIOD; i++) {
            this.schoolSizeInDays[i] = 1;
        }

        for (let i = INITIAL_GROWTH_PERIOD; i < TOTAL_DAYS_TO_SIMULATE; i++) {
            const schoolSizeInitialGrowthPeriodDaysAgo = this.schoolSizeInDays[i - INITIAL_GROWTH_PERIOD];
            const schoolSizeGrowthPeriodDaysAgo = this.schoolSizeInDays[i - GROWTH_PERIOD];
            this.schoolSizeInDays[i] = schoolSizeInitialGrowthPeriodDaysAgo + schoolSizeGrowthPeriodDaysAgo;
        }
    }

    lookUpSchoolSizeByInitialAge(ageInDays: number): number {
        return this.schoolSizeInDays[INITIAL_GROWTH_PERIOD - ageInDays - 1 + TOTAL_DAYS];
    }

    run(fileName: string) {
        const firstGeneration = readCommaSeparatedNumbersFromFile(fileName);

        const totalFish = sum(firstGeneration.map(age => this.lookUpSchoolSizeByInitialAge(age)));
        console.info(`Final school size for "${fileName}": ${totalFish}`);
    }
}

const sim = new Simulation();
sim.dumpSingleFish();
sim.run("input/06-example.txt");
sim.run("input/06.txt");
