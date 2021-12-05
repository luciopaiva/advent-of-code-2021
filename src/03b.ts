
import {readLines} from "./utils";

type OptionalBinaryTrieNode = BinaryTrieNode | undefined;

class BinaryTrieNode {
    count = 0;
    left: OptionalBinaryTrieNode;
    right: OptionalBinaryTrieNode;
    value: string;

    insert(word: string, index = 0) {
        let child;
        const isZero = word[index] === "0";

        if (isZero) {
            if (this.left === undefined) {
                this.left = new BinaryTrieNode();
            }
            child = this.left;
        } else {
            if (this.right === undefined) {
                this.right = new BinaryTrieNode();
            }
            child = this.right;
        }

        child.count++;
        child.value = word;

        if (index + 1 < word.length) {
            child.insert(word, index + 1);
        }
    }

    getWordWithMostCommonBits(): string {
        if (this.left === undefined && this.right === undefined) {
            return this.value;
        } else if (this.left !== undefined && (this.right === undefined || this.left.count > this.right.count)) {
            return this.left.getWordWithMostCommonBits();
        } else if (this.right !== undefined) {
            return this.right.getWordWithMostCommonBits()
        }
        throw new Error("Should not get here");
    }

    getWordWithLeastCommonBits(): string {
        if (this.left === undefined && this.right === undefined) {
            return this.value;
        } else if (this.left !== undefined && (this.right === undefined || this.left.count <= this.right.count)) {
            return this.left.getWordWithLeastCommonBits();
        } else if (this.right !== undefined) {
            return this.right.getWordWithLeastCommonBits()
        }
        throw new Error("Should not get here");
    }
}

const root = new BinaryTrieNode();

for await (const line of readLines("input/03.txt")) {
    root.insert(line);
}

const oxygen = parseInt(root.getWordWithMostCommonBits(), 2);
const co2 = parseInt(root.getWordWithLeastCommonBits(), 2);

console.info("Oxygen generator: " + oxygen);
console.info("CO2 scrubber: " + co2);
console.info("Multiplication: " + (oxygen * co2));
