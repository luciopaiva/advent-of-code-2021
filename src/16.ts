
import * as fs from "fs";

class PacketDecoder {

    private p: number = 0;
    private versionSum = 0;

    constructor(private readonly bits: string) {
    }

    read(): number {
        return this.readPacket();
    }

    readPacket(): number {
        const version = this.read3BitValue();
        const type = this.read3BitValue();
        this.versionSum += version;
        console.info("Packet version " + version + ", type " + type);

        switch (type) {
            case 0: return this.readSum();
            case 1: return this.readProduct();
            case 2: return this.readMin();
            case 3: return this.readMax();
            case 4: return this.readLiteral();
            case 5: return this.readGreaterThan();
            case 6: return this.readLessThan();
            case 7: return this.readEqualTo();
            default: throw new Error(`Invalid packet type ${type}`);
        }
    }

    readSum() {
        const result = [...this.readOperator()].reduce((sum, term) => sum + term, 0);
        console.info("Sum " + result);
        return result;
    }

    readProduct() {
        const result = [...this.readOperator()].reduce((product, factor) => product * factor, 1);
        console.info("Product " + result);
        return result;
    }

    readMin() {
        const result = Math.min(...this.readOperator());
        console.info("Min " + result);
        return result;
    }

    readMax() {
        const result = Math.max(...this.readOperator());
        console.info("Min " + result);
        return result;
    }

    readGreaterThan() {
        const [a, b] = [...this.readOperator()];
        const result = a > b ? 1 : 0;
        console.info("Greater than " + result);
        return result;
    }

    readLessThan() {
        const [a, b] = [...this.readOperator()];
        const result = a < b ? 1 : 0;
        console.info("Less than " + result);
        return result;
    }

    readEqualTo() {
        const [a, b] = [...this.readOperator()];
        const result = a === b ? 1 : 0;
        console.info("Equal to " + result);
        return result;
    }

    readBits(l: number) {
        const bits = this.bits.slice(this.p, this.p + l);
        this.p += l;
        return bits;
    }

    *readOperator(): Generator<number> {
        const lengthType = this.readBits(1);
        if (lengthType === "0") {
            const length = parseInt(this.readBits(15), 2);
            const limit = this.p + length;
            while (this.p < limit) {
                yield this.readPacket();
            }
        } else {
            const packetCount = parseInt(this.readBits(11), 2);
            for (let i = 0; i < packetCount; i++) {
                yield this.readPacket();
            }
        }
    }

    readLiteral() {
        let chunk = "", flag;
        do {
            flag = this.readBits(1);
            chunk += this.readBits(4);
        } while (flag === "1");
        const literal = parseInt(chunk, 2);
        console.info("Literal " + literal);
        return literal;
    }

    read3BitValue() {
        return parseInt(this.readBits(3), 2);
    }

    static runInput(input: string, fileName: string = "?") {
        const bits = input.replace(/\s/g, "").split("")
            .map(X => parseInt(X, 16)).map(n => n.toString(2).padStart(4, "0")).join("");

        const decoder = new PacketDecoder(bits);
        const result = decoder.read();
        console.info(`[${fileName}] version sum (part 1): ${decoder.versionSum}`);
        console.info(`[${fileName}] result (part 2): ${result}`);
    }

    static run(fileName: string) {
        PacketDecoder.runInput(fs.readFileSync(fileName, "utf-8"), fileName);
    }
}

PacketDecoder.run("input/16.txt");
