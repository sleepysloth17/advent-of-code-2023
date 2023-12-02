import { FileUtils } from "../utils/file-utils";

interface Bag {
  red: number;
  blue: number;
  green: number;
}

class Round {
  public static fromString(roundString: string): Round {
    return new Round(
      Round.getValueOfColour(roundString, "red"),
      Round.getValueOfColour(roundString, "blue"),
      Round.getValueOfColour(roundString, "green"),
    );
  }

  private static getValueOfColour(
    value: string,
    colour: "red" | "blue" | "green",
  ): number {
    const regExp: RegExp = new RegExp(`(\\d+) ${colour}`);
    if (regExp.test(value)) {
      return +value.match(regExp)[1];
    }

    return null;
  }

  constructor(
    public red: number,
    public blue: number,
    public green: number,
  ) {}

  public test(bag: Bag): boolean {
    return Object.keys(bag).every((c) => bag[c] >= this[c]);
  }
}

class Game {
  public static fromLine(line: string): Game {
    const splitOnColon: string[] = line.split(": ");
    const roundStrings: string[] = splitOnColon[1].split("; ");
    return new Game(
      Game.parseId(splitOnColon[0]),
      roundStrings.map(Round.fromString),
    );
  }

  private static parseId(idString: string): number {
    return +idString.replace("Game ", "");
  }

  constructor(
    public id: number,
    private rounds: Round[],
  ) {}

  public test(bag: Bag): boolean {
    return this.rounds.every((round) => round.test(bag));
  }

  public getPower(): number {
    const minSet: Bag = this.getMinimumSet();
    return minSet.red * minSet.blue * minSet.green;
  }

  private getMinimumSet(): Bag {
    return {
      red: Math.max(...this.rounds.map((r) => r.red)),
      blue: Math.max(...this.rounds.map((r) => r.blue)),
      green: Math.max(...this.rounds.map((r) => r.green)),
    };
  }
}

function sumValidGameIds(filename: string, bag: Bag): number {
  return FileUtils.mapFileToList(__dirname, filename, Game.fromLine)
    .filter((game) => game.test(bag))
    .reduce((total: number, game: Game) => total + game.id, 0);
}

function sumPowers(filename: string): number {
  return FileUtils.mapFileToList(__dirname, filename, Game.fromLine)
    .map((game) => game.getPower())
    .reduce((total: number, current: number) => total + current, 0);
}

console.log(
  "Example Part 1:",
  sumValidGameIds("./example.txt", { red: 12, green: 13, blue: 14 }),
);
console.log(
  "Part 1:",
  sumValidGameIds("./input.txt", { red: 12, green: 13, blue: 14 }),
);

console.log("Example Part 2:", sumPowers("./example.txt"));
console.log("Part 2:", sumPowers("./input.txt"));
