
import * as fs from "fs";

const expressionsByType: ((...string) => string)[] = [
    (...t) => `(${t.join(" + ")})`,
    (...t) => `(${t.join(" * ")})`,
    (...t) => `Math.min(${t.join(", ")})`,
    (...t) => `Math.max(${t.join(", ")})`,
    (a)    => `${a}`,
    (a, b) => `(${a} > ${b})`,
    (a, b) => `(${a} < ${b})`,
    (a, b) => `(${a} == ${b})`,
];

class PacketDecoder {

    private cursor: number = 0;
    private versionSum = 0;

    constructor(private readonly bits: string) {
    }

    read(): string {
        return this.readPacket();
    }

    readPacket(): string {
        const version = this.read3BitValue();
        const type = this.read3BitValue();
        this.versionSum += version;

        return type === 4 ? this.readLiteral() : this.readPacketType(type);
    }

    readBits(l: number) {
        const bits = this.bits.slice(this.cursor, this.cursor + l);
        this.cursor += l;
        return bits;
    }

    readPacketType(type: number): string {
        const lengthType = this.readBits(1);
        if (lengthType === "0") {
            const length = parseInt(this.readBits(15), 2);
            return this.processOperation(type, ...this.readOperandsByLength(length));
        } else {
            const packetCount = parseInt(this.readBits(11), 2);
            return this.processOperation(type, ...this.readOperandsByCount(packetCount));
        }
    }

    *readOperandsByLength(length: number): Generator<string> {
        const limit = this.cursor + length;
        while (this.cursor < limit) {
            yield this.readPacket();
        }
    }

    *readOperandsByCount(count: number): Generator<string> {
        for (let i = 0; i < count; i++) {
            yield this.readPacket();
        }
    }

    readLiteral(): string {
        let chunk = "", flag;
        do {
            flag = this.readBits(1);
            chunk += this.readBits(4);
        } while (flag === "1");
        const literal = parseInt(chunk, 2);
        return this.processOperation(4, literal.toString());
    }

    processOperation(type: number, ...terms: string[]): string {
        return expressionsByType[type](...terms);
    }

    read3BitValue() {
        return parseInt(this.readBits(3), 2);
    }

    static runInput(input: string, fileName: string = "?") {
        const bits = input.replace(/\s/g, "").split("")
            .map(X => parseInt(X, 16)).map(n => n.toString(2).padStart(4, "0")).join("");

        const decoder = new PacketDecoder(bits);
        const expression = decoder.read();
        console.info(`[${fileName}] part 1, version sum: ${decoder.versionSum}`);
        console.info(`[${fileName}] part 2, expression: ${expression}`);
        console.info(`[${fileName}] part 2, result: ${eval(expression)}`);
    }

    static run(fileName: string) {
        PacketDecoder.runInput(fs.readFileSync(fileName, "utf-8"), fileName);
    }
}

PacketDecoder.run("input/16.txt");
