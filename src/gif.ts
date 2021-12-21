
import * as GIFEncoder from "gifencoder";
import * as PImage from "pureimage";
import * as fs from "fs";
import {CanvasRenderingContext2D} from "canvas";
import {Bitmap} from "pureimage/types/bitmap";

export default class Gif {

    private readonly imageWidth: number;
    private readonly imageHeight: number;
    private readonly canvas: Bitmap;
    private readonly ctx: CanvasRenderingContext2D;
    private readonly encoder: GIFEncoder;

    constructor(private width: number, private height: number, private scale: number, name: string) {
        this.imageWidth = width * scale;
        this.imageHeight = height * scale;

        this.encoder = new GIFEncoder(this.imageWidth, this.imageHeight);
        this.encoder.createReadStream().pipe(fs.createWriteStream(`output/${name}.gif`));
        this.encoder.start();
        this.encoder.setRepeat(0);
        this.encoder.setDelay(100);
        this.encoder.setQuality(10);

        this.canvas = PImage.make(this.imageWidth, this.imageHeight, undefined);
        this.ctx = this.canvas.getContext("2d") as unknown as CanvasRenderingContext2D;
    }

    addFrame(points: number[]) {
        this.ctx.fillStyle = "#000000";
        this.ctx.fillRect(0, 0, this.imageWidth, this.imageHeight);

        for (let y = 0; y < this.width; y++) {
            for (let x = 0; x < this.height; x++) {
                const point = points[y * this.width + x];
                const v = Math.floor(255 * point).toString(16).padStart(2, "0");
                this.ctx.fillStyle = `#0000${v}`;
                this.ctx.fillRect(x * this.scale, y * this.scale, this.scale, this.scale);
            }
        }

        this.encoder.addFrame(this.ctx);
    }

    addFrameNoScale(points: number[]) {
        for (let y = 0; y < this.width; y++) {
            for (let x = 0; x < this.height; x++) {
                const point = points[y * this.width + x];
                this.canvas.setPixelRGBA(x, y, point > 0 ? 0x0000ffff : 0x000000ff);
            }
        }

        this.encoder.addFrame(this.ctx);
    }

    finish() {
        this.encoder.finish();
    }
}
