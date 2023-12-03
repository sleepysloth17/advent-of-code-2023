import { FileUtils } from "../utils/file-utils";

interface Square {
  value: string;
  isInt: boolean;
}

function setAdjacencyForIncrements(
  row: number,
  col: number,
  incrementList: number[][],
  newEntry: number,
  adjacencyMap: Record<number, Record<number, number[]>>,
): void {
  incrementList.forEach(([rowIncremenet, colIncrement]) => {
    if (!adjacencyMap[row + rowIncremenet]) {
      adjacencyMap[row + rowIncremenet] = {};
    }

    if (!adjacencyMap[row + rowIncremenet][col + colIncrement]) {
      adjacencyMap[row + rowIncremenet][col + colIncrement] = [];
    }

    adjacencyMap[row + rowIncremenet][col + colIncrement].push(newEntry);
  });
}

function setAdjacency(
  row: number,
  currentNumberString: string,
  currentNumberColumns: number[],
  adjacencyMap: Record<number, Record<number, number[]>>,
): void {
  setAdjacencyForIncrements(
    row,
    currentNumberColumns[0],
    [
      [-1, -1],
      [0, -1],
      [1, -1],
    ],
    +currentNumberString,
    adjacencyMap,
  );
  currentNumberColumns.forEach((numberCol: number) =>
    setAdjacencyForIncrements(
      row,
      numberCol,
      [
        [-1, 0],
        [1, 0],
      ],
      +currentNumberString,
      adjacencyMap,
    ),
  );
  setAdjacencyForIncrements(
    row,
    currentNumberColumns.at(-1),
    [
      [-1, 1],
      [0, 1],
      [1, 1],
    ],
    +currentNumberString,
    adjacencyMap,
  );
}

function parseRow2(
  line: string,
  row: number,
  adjacencyMap: Record<number, Record<number, number[]>>,
): Square[] {
  let currentNumberString: string = "";
  let currentNumberColumns: number[] = [];

  return line.split("").map((char: string, col: number, arr: string[]) => {
    const isInt: boolean = !isNaN(+char);

    if (isInt) {
      currentNumberString += char;
      currentNumberColumns.push(col);

      if (col === arr.length - 1) {
        setAdjacency(
          row,
          currentNumberString,
          currentNumberColumns,
          adjacencyMap,
        );
      }
    } else {
      setAdjacency(
        row,
        currentNumberString,
        currentNumberColumns,
        adjacencyMap,
      );
      currentNumberString = "";
      currentNumberColumns = [];
    }

    return {
      value: char,
      isInt,
    };
  });
}

function parseRow(
  line: string,
  row: number,
  adjacencyMap: Record<number, Record<number, boolean>>,
): Square[] {
  return line.split("").map((char: string, cell: number) => {
    const isInt: boolean = !isNaN(+char);

    const isSymbol: boolean = !isInt && char !== ".";
    if (isSymbol) {
      [
        [-1, -1],
        [-1, 0],
        [-1, 1],
        [0, -1],
        [0, 1],
        [1, -1],
        [1, 0],
        [1, 1],
      ].forEach(([rowIncremenet, cellIncrement]) => {
        if (!adjacencyMap[row + rowIncremenet]) {
          adjacencyMap[row + rowIncremenet] = {};
        }

        adjacencyMap[row + rowIncremenet][cell + cellIncrement] = true;
      });
    }

    return {
      value: char,
      isInt,
    };
  });
}

function getAdjcentNumbers(filename: string): number[] {
  const adjacencyMap: Record<number, Record<number, boolean>> = {};
  const grid: Square[][] = FileUtils.mapFileToList(
    __dirname,
    filename,
    (line: string, index: number) => parseRow(line, index, adjacencyMap),
  );

  const numbers: number[] = [];

  for (let i = 0; i < grid.length; i++) {
    const row: Square[] = grid[i];

    let currentNumberNextToValue: boolean = false;
    let currentNumberString: string = "";

    for (let j = 0; j < row.length; j++) {
      const cell: Square = row[j];
      if (cell.isInt) {
        currentNumberString += cell.value;

        if (adjacencyMap[i]?.[j]) {
          currentNumberNextToValue = true;
        }
      }

      if (!cell.isInt) {
        if (currentNumberString && currentNumberNextToValue) {
          numbers.push(+currentNumberString);
        }

        currentNumberNextToValue = false;
        currentNumberString = "";
      }
    }

    if (currentNumberString && currentNumberNextToValue) {
      numbers.push(+currentNumberString);
    }
  }

  return numbers;
}

function sumAdjacentNumbers(filename: string): number {
  return getAdjcentNumbers(filename).reduce((a, b) => a + b, 0);
}

function getGearNumbers(filename: string): number[] {
  const adjacencyMap: Record<number, Record<number, number[]>> = {};
  const grid: Square[][] = FileUtils.mapFileToList(
    __dirname,
    filename,
    (line: string, index: number) => parseRow2(line, index, adjacencyMap),
  );

  const numbers: number[] = [];

  for (let i = 0; i < grid.length; i++) {
    const row: Square[] = grid[i];
    for (let j = 0; j < row.length; j++) {
      const cell: Square = row[j];
      if (cell.value === "*" && adjacencyMap[i]?.[j]?.length === 2) {
        numbers.push(adjacencyMap[i][j][0] * adjacencyMap[i][j][1]);
      }
    }
  }

  return numbers;
}

function sumGearNumbers(filename: string): number {
  return getGearNumbers(filename).reduce((a, b) => a + b, 0);
}

console.log("Example Part 1: ", sumAdjacentNumbers("./example.txt"));

console.log("Part 1: ", sumAdjacentNumbers("./input.txt"));

console.log("Example Part 2: ", sumGearNumbers("./example.txt"));

console.log("Part 2: ", sumGearNumbers("./input.txt"));
