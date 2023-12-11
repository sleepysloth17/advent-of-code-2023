import { FileUtils } from "../utils/file-utils";

interface Galaxy {
  x: number;
  y: number;
}

interface Universe {
  galaxies: Galaxy[];
  initialEmptyRows: number[];
  initialEmptyColumns: number[];
}

const getGalaxiesFromRow: (line: string, x: number) => Galaxy[] = (
  line: string,
  x: number,
) => {
  return line
    .split("")
    .map((char: string, y: number) =>
      char === "#"
        ? {
            x,
            y,
          }
        : null,
    )
    .filter(Boolean);
};

const getUniverse: (filename: string) => Universe = (filename: string) => {
  const lines: string[] = FileUtils.readLines(__dirname, filename);
  const galaxies: Galaxy[] = lines.flatMap(getGalaxiesFromRow);

  const filledRows: Set<number> = new Set(
    galaxies.map((galaxy: Galaxy) => galaxy.x),
  );
  const filledColumns: Set<number> = new Set(
    galaxies.map((galaxy: Galaxy) => galaxy.y),
  );

  return {
    galaxies,
    initialEmptyRows: new Array(lines.length)
      .fill(null)
      .map((val: unknown, index: number) => index)
      .filter((row: number) => !filledRows.has(row)),
    initialEmptyColumns: new Array(lines[0].length)
      .fill(null)
      .map((val: unknown, index: number) => index)
      .filter((row: number) => !filledColumns.has(row)),
  };
};

const expandUniverseByN: (universe: Universe, n: number) => Universe = (
  universe: Universe,
  n: number,
) => {
  const newGalaxies: Galaxy[] = universe.galaxies.map((galaxy: Galaxy) => {
    const previousEmptyRowCount: number = universe.initialEmptyRows.filter(
      (row: number) => row < galaxy.x,
    ).length;
    const previousEmptyColCount: number = universe.initialEmptyColumns.filter(
      (col: number) => col < galaxy.y,
    ).length;

    return {
      x: galaxy.x + previousEmptyRowCount * n,
      y: galaxy.y + previousEmptyColCount * n,
    };
  });

  return {
    galaxies: newGalaxies,
    initialEmptyRows: universe.initialEmptyRows,
    initialEmptyColumns: universe.initialEmptyColumns,
  };
};

const getExpandedUniverse: (filename: string, n: number) => Universe = (
  filename: string,
  n: number,
) => {
  return expandUniverseByN(getUniverse(filename), n);
};

const getDistances: (universe: Universe) => number[] = (universe: Universe) => {
  const returnList: number[] = [];
  for (let i = 0; i < universe.galaxies.length; i++) {
    for (let j = i + 1; j < universe.galaxies.length; j++) {
      returnList.push(
        Math.abs(universe.galaxies[i].y - universe.galaxies[j].y) +
          Math.abs(universe.galaxies[i].x - universe.galaxies[j].x),
      );
    }
  }

  return returnList;
};

const getSumOfDisances: (universe: Universe) => number = (
  universe: Universe,
) => {
  return getDistances(universe).reduce(
    (total: number, current: number) => total + current,
    0,
  );
};

console.log(
  "Example Part 1: ",
  getSumOfDisances(getExpandedUniverse("example.txt", 1)),
);

console.log("Part 1: ", getSumOfDisances(getExpandedUniverse("input.txt", 1)));

console.log(
  "Example Part 2: ",
  getSumOfDisances(getExpandedUniverse("example.txt", 100 - 1)),
);

console.log(
  "Part 2: ",
  getSumOfDisances(getExpandedUniverse("input.txt", 1000000 - 1)),
);
