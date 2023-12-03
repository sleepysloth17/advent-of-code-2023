import { FileUtils } from "../utils/file-utils";

interface Square {
  value: string;
  isInt: boolean;
}

function parseRow(
  line: string,
  row: number,
  adjacencyMap: Record<number, Record<number, boolean>>,
): Square[] {
  return line.split("").map((char: string, cell: number) => {
    const isInt: boolean = !isNaN(parseInt(char));

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

  console.log(numbers);

  return numbers;
}

function sumAdjacentNumbers(filename: string): number {
  return getAdjcentNumbers(filename).reduce((a, b) => a + b, 0);
}

console.log("Example Part 1: ", sumAdjacentNumbers("./example.txt"));

console.log("Part 1: ", sumAdjacentNumbers("./input.txt"));
