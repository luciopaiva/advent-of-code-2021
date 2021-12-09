
import * as fs from "fs";

const TOTAL_DAYS = 80;
const NEWBORN_AGE = 9;
const AGE_AFTER_GROW = 7;

function grow(ageInDays: number, daysLeft: number): number {
    let count = 1;
    daysLeft -= ageInDays;
    while (daysLeft > 0) {
        count += grow(NEWBORN_AGE, daysLeft);
        ageInDays = AGE_AFTER_GROW;
        daysLeft -= ageInDays;
    }
    return count;
}

const line = fs.readFileSync("input/06.txt", "utf-8").split("\n")[0];
const firstGeneration = line.split(",").map(s => parseInt(s));

let count = 0;
for (const fish of firstGeneration) {
    count += grow(fish, TOTAL_DAYS);
}

console.info("Final school size: " + count);
