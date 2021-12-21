
import {readLines} from "./utils";

interface Player {
    points: number;
    position: number;
}

class Die {
    public count = 0;
    private state = 0;
    roll(): number {
        this.state = (this.state + 1) % 100;
        this.count++;
        return this.state;
    }
}

async function input(fileName: string): Promise<Player[]> {
    const players: Player[] = [];
    for await (const line of readLines(fileName)) {
        const m = line.match(/:\s(\d+)/);
        players.push({
            points: 0,
            position: parseInt(m[1]) - 1,
        });
    }
    return players;
}

async function run(fileName: string) {
    const players = await input(fileName);

    for (const player of players) {
        console.info(player.position, player.points);
    }

    const die = new Die();

    let losingPlayer: Player;
    do {
        for (let i = 0; i < players.length; i++) {
            const player = players[i];
            player.position = (player.position + die.roll() + die.roll() + die.roll()) % 10;
            player.points += player.position + 1;
            if (player.points >= 1000) {
                losingPlayer = players[(i + 1) % players.length];
                break;
            }
        }
    } while (!losingPlayer);

    const result = losingPlayer.points * die.count;
    console.info(`[${fileName}] part 1: ${result}`);
}

await run("input/21-example.txt");
await run("input/21.txt");
