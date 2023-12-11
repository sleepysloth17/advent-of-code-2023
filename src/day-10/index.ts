import { FileUtils } from "../utils/file-utils";

interface CoOrdinate {
  x: number;
  y: number;
}

type PipeType = "|" | "-" | "L" | "J" | "7" | "F" | "S";

class Pipe {
  private static TYPE_TO_DIRECTION: Record<
    Exclude<PipeType, ".">,
    CoOrdinate[]
  > = {
    ["|"]: [
      { x: -1, y: 0 },
      { x: 1, y: 0 },
    ],
    ["-"]: [
      { x: 0, y: 1 },
      { x: 0, y: -1 },
    ],
    ["L"]: [
      { x: -1, y: 0 },
      { x: 0, y: 1 },
    ],
    ["J"]: [
      { x: -1, y: 0 },
      { x: 0, y: -1 },
    ],
    ["7"]: [
      { x: 1, y: 0 },
      { x: 0, y: -1 },
    ],
    ["F"]: [
      { x: 1, y: 0 },
      { x: 0, y: 1 },
    ],
    ["S"]: [
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 },
    ],
  };

  public static fromValue(x: number, y: number, value: string): Pipe {
    return new Pipe(
      value as PipeType,
      { x, y },
      Pipe.TYPE_TO_DIRECTION[value]?.map((diff: CoOrdinate) => ({
        x: diff.x + x,
        y: diff.y + y,
      })) || [],
    );
  }

  public readonly isStart: boolean;

  constructor(
    private readonly _type: PipeType,
    public readonly coOrdinate: CoOrdinate,
    private readonly _connectedCoOrds: Readonly<CoOrdinate[]>,
  ) {
    this.isStart = this._type === "S";
  }

  public next(grid: Grid, from: Pipe): Pipe {
    const newCoOrd: CoOrdinate = this._connectedCoOrds.find(
      (connected: CoOrdinate) =>
        from.coOrdinate.x !== connected.x || from.coOrdinate.y !== connected.y,
    );
    const newPipe: Pipe = newCoOrd ? grid[newCoOrd.x]?.[newCoOrd.y] : null;
    return this.joinsToOther(newPipe) ? newPipe : null;
  }

  public getNeighbouringPipes(grid: Grid): Pipe[] {
    return this._connectedCoOrds
      .map((coOrds: CoOrdinate) => grid[coOrds.x]?.[coOrds.y])
      .filter(Boolean)
      .filter((pipe: Pipe) => pipe.joinsToOther(this));
  }

  public joinsToOther(other: Pipe): boolean {
    return this._connectedCoOrds.some(
      (connected: CoOrdinate) =>
        connected.x === other.coOrdinate.x &&
        connected.y === other.coOrdinate.y,
    );
  }
}

type Row = Record<number, Pipe>;

type Grid = Record<number, Row>;

const parseRow: (rowIndex: number, line: string) => Row = (
  rowIndex: number,
  line: string,
) => {
  return line
    .split("")
    .reduce((row: Row, currentValue: string, index: number) => {
      row[index] = Pipe.fromValue(rowIndex, index, currentValue);
      return row;
    }, {});
};

const parseGrid: (filename: string) => Grid = (filename: string) => {
  const lines: string[] = FileUtils.readLines(__dirname, filename);
  return lines.reduce(
    (returnGrid: Grid, currentLine: string, index: number) => {
      returnGrid[index] = parseRow(index, currentLine);
      return returnGrid;
    },
    {},
  );
};

const getStart: (grid: Grid) => Pipe = (grid: Grid) => {
  for (const row of Object.values(grid)) {
    const start: Pipe = Object.values(row).find((pipe: Pipe) => pipe.isStart);
    if (start) {
      return start;
    }
  }

  throw new Error("No start element found");
};

const getWalk: (filename: string) => Pipe[] = (filename: string) => {
  const grid: Grid = parseGrid(filename);
  const start: Pipe = getStart(grid);

  let walk: Pipe[];
  for (const potentialStart of start.getNeighbouringPipes(grid)) {
    let previousPipe: Pipe = start;
    let currentPipe: Pipe = potentialStart;
    walk = [start];

    while (currentPipe && !currentPipe.isStart) {
      walk.push(currentPipe);

      const current: Pipe = currentPipe;
      currentPipe = currentPipe.next(grid, previousPipe);
      previousPipe = current;
    }

    if (currentPipe?.isStart) {
      break;
    }
  }

  return walk;
};

const getFurthestPoint: (filename: string) => number = (filename: string) => {
  return getWalk(filename).length / 2;
};

/**
 * Going to treat the path like a polynomial on a cartesian graph, and thus can use (from a bit of goolging):
 * - https://en.wikipedia.org/wiki/Shoelace_formula
 * - https://en.wikipedia.org/wiki/Pick%27s_theorem
 */
const getContainedArea: (filename: string) => number = (filename: string) => {
  const walk: Pipe[] = getWalk(filename);

  const totalArea: number = Math.abs(
    walk.reduce((area: number, current: Pipe, index: number, array: Pipe[]) => {
      const next: Pipe = array[(index + 1) % walk.length];
      return (
        area +
        current.coOrdinate.x * next.coOrdinate.y -
        current.coOrdinate.y * next.coOrdinate.x
      );
    }, 0),
  );

  return 1 + 0.5 * (totalArea - walk.length);
};

console.log("Example Part 1: ", getFurthestPoint("example.txt"));

console.log("Part 1: ", getFurthestPoint("input.txt"));

console.log("Example Part 2: ", getContainedArea("example-2.txt"));
console.log("Example Part 2: ", getContainedArea("example-3.txt"));

console.log("Part 2: ", getContainedArea("input.txt"));
