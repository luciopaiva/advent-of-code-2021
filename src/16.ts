
import * as fs from "fs";

class PacketDecoder {

    private p: number = 0;
    private versionSum = 0;

    constructor(private readonly bits: string) {
    }

    readPacket() {
        const version = this.read3BitValue();
        const type = this.read3BitValue();
        this.versionSum += version;
        console.info("Packet version " + version + ", type " + type);
        if (type === 4) {
            this.readLiteral();
        } else {
            this.readOperator(type);
        }
    }

    readBits(l: number) {
        const bits = this.bits.slice(this.p, this.p + l);
        this.p += l;
        return bits;
    }

    readOperator(operator: number) {
        console.info("Operator " + operator);
        const lengthType = this.readBits(1);
        if (lengthType === "0") {
            const length = parseInt(this.readBits(15), 2);
            const limit = this.p + length;
            while (this.p < limit) {
                this.readPacket();
            }
        } else {
            const packetCount = parseInt(this.readBits(11), 2);
            for (let i = 0; i < packetCount; i++) {
                this.readPacket();
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

    static run(fileName: string) {
        const input = fs.readFileSync(fileName, "utf-8")
        const bits = input.replace(/\s/g, "").split("")
            .map(X => parseInt(X, 16)).map(n => n.toString(2).padStart(4, "0")).join("");

        const decoder = new PacketDecoder(bits);
        decoder.readPacket();
        console.info(`[${fileName}] version sum: ${decoder.versionSum}`);
    }
}

PacketDecoder.run("input/16.txt");
