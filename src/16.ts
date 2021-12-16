
import * as fs from "fs";

const OPERATIONS: ((...number) => number)[] = [
    (...t) => t.reduce((sum, term) => sum + term, 0),
    (...t) => t.reduce((product, factor) => product * factor, 1),
    Math.min,
    Math.max,
    a => a,
    (a, b) => a > b ? 1 : 0,
    (a, b) => a < b ? 1 : 0,
    (a, b) => a === b ? 1 : 0,
];

const EXPRESSIONS: ((...string) => string)[] = [
    (...t) => `(${t.join(" + ")})`,
    (...t) => `(${t.join(" * ")})`,
    (...t) => `min(${t.join(", ")})`,
    (...t) => `max(${t.join(", ")})`,
    a => `${a}`,
    (a, b) => `(${a} > ${b})`,
    (a, b) => `(${a} < ${b})`,
    (a, b) => `(${a} == ${b})`,
];

class PacketDecoder {

    private p: number = 0;
    private versionSum = 0;

    constructor(private readonly bits: string) {
    }

    read(): [number, string] {
        return this.readPacket();
    }

    readPacket(): [number, string] {
        const version = this.read3BitValue();
        const type = this.read3BitValue();
        this.versionSum += version;

        return type === 4 ? this.readLiteral() : this.readPacketType(type);
    }

    readBits(l: number) {
        const bits = this.bits.slice(this.p, this.p + l);
        this.p += l;
        return bits;
    }

    readPacketType(type: number): [number, string] {
        const lengthType = this.readBits(1);
        if (lengthType === "0") {
            const length = parseInt(this.readBits(15), 2);
            return this.processOperation(type, ...this.readOperandsByLength(length));
        } else {
            const packetCount = parseInt(this.readBits(11), 2);
            return this.processOperation(type, ...this.readOperandsByCount(packetCount));
        }
    }

    *readOperandsByLength(length: number): Generator<[number, string]> {
        const limit = this.p + length;
        while (this.p < limit) {
            yield this.readPacket();
        }
    }

    *readOperandsByCount(count: number): Generator<[number, string]> {
        for (let i = 0; i < count; i++) {
            yield this.readPacket();
        }
    }

    readLiteral(): [number, string] {
        let chunk = "", flag;
        do {
            flag = this.readBits(1);
            chunk += this.readBits(4);
        } while (flag === "1");
        const literal = parseInt(chunk, 2);
        return this.processOperation(4, [literal, literal.toString()]);
    }

    processOperation(type: number, ...terms: [number, string][]): [number, string] {
        const values = terms.map(t => t[0]);
        const expressions = terms.map(t => t[1]);
        return [OPERATIONS[type](...values), EXPRESSIONS[type](...expressions)];
    }

    read3BitValue() {
        return parseInt(this.readBits(3), 2);
    }

    static runInput(input: string, fileName: string = "?") {
        const bits = input.replace(/\s/g, "").split("")
            .map(X => parseInt(X, 16)).map(n => n.toString(2).padStart(4, "0")).join("");

        const decoder = new PacketDecoder(bits);
        const [result, expression] = decoder.read();
        console.info(`[${fileName}] version sum (part 1): ${decoder.versionSum}`);
        console.info(`[${fileName}] result (part 2): ${result}`);
        console.info(`[${fileName}] expression: ${expression}`)
    }

    static run(fileName: string) {
        PacketDecoder.runInput(fs.readFileSync(fileName, "utf-8"), fileName);
    }
}

PacketDecoder.run("input/16.txt");
