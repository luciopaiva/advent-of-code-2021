
import {HashMap, readLines} from "./utils";

class Node {

    private neighbors: Set<Node> = new Set();
    private readonly isSmallCave: boolean;

    constructor(private name: string) {
        this.isSmallCave = name === name.toLowerCase();
    }

    toString() {
        return this.name;
    }

    connect(other: Node) {
        this.neighbors.add(other);
    }

    search(path: Node[], hasExtraVisit: boolean): number {
        if (path.length > 0 && this.name === "start") {
            return 0;
        }

        if (this.isSmallCave && path.includes(this)) {
            if (hasExtraVisit) {
                hasExtraVisit = false;
            } else {
                return 0;
            }
        }

        path.push(this);

        if (this.name === "end") {
            // console.info(path.map(n => n.name).join(","));
            return 1;
        }

        let pathCounts = 0;
        for (const neighbor of this.neighbors) {
            pathCounts += neighbor.search(Array.from(path), hasExtraVisit);
        }

        return pathCounts;
    }
}

class Solution {

    private nodesByName: HashMap<string, Node> = new HashMap();

    offerPair(nameA: string, nameB: string) {
        const nodeA = this.nodesByName.computeIfAbsent(nameA, () => new Node(nameA));
        const nodeB = this.nodesByName.computeIfAbsent(nameB, () => new Node(nameB));
        nodeA.connect(nodeB);
        nodeB.connect(nodeA);
    }

    run(useExtraVisit: boolean): number {
        const start = this.nodesByName.get("start");
        return start.search([], useExtraVisit);
    }
}

async function run(fileName: string) {
    const solution = new Solution();

    for await (const line of readLines(fileName)) {
        const [nodeA, nodeB] = line.split("-");
        solution.offerPair(nodeA, nodeB);
    }

    console.info(`[${fileName}] number of paths: ${solution.run(false)}`);
    console.info(`[${fileName}] number of paths with extra visit: ${solution.run(true)}`);
}

await run("input/12-example-1.txt");
await run("input/12-example-2.txt");
await run("input/12-example-3.txt");
await run("input/12.txt");
