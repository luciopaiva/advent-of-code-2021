
let points = new Set();
const D = c => c.split(",").map(s => parseInt(s));

require("fs").readFileSync("input/13.txt","utf-8")
    .split("\n").map(s => s.trim()).filter(s => s).forEach(a => {
    a.includes(",") ? points.add(a) : (() => {
        const [d, s] = a.match(/(.)=(\d+)/).slice(1);
        const l = parseInt(s);
        points = new Set([...points].map(D)
            .map(([x, y]) => `${d === "x" && x > l ? 2 * l - x : x},${d === "y" && y > l ? 2 * l - y : y}`));
    })();
});

const m = Array.from(Array(64), () => [..." ".repeat(64)]);
[...points].map(D).map(([x, y]) => m[y][x] = "#");
m.map(l => l.join("").trimEnd()).filter(l => l.length > 0).forEach(l => console.info(l));
