import { FileUtils } from "../utils/file-utils";
import { ParsingUtils } from "../utils/parsing-utils";

type Polynomial = (x: number) => number;

interface Row {
  values: number[];
  polynomial: Polynomial;
}

// https://coast.nd.edu/jjwteach/www/www/30125/pdfnotes/lecture3_6v13.pdf
const getVi: (xList: number[], j: number) => Polynomial = (
  xList: number[],
  j: number,
) => {
  return (x: number) => {
    const xj: number = xList[j];
    return xList.reduce((v: number, xi: number, index: number) => {
      if (index === j) {
        return v;
      }

      return ((x - xi) / (xj - xi)) * v;
    }, 1);
  };
};

const getG: (yList: number[]) => Polynomial = (yList: number[]) => {
  return (x: number) => {
    const xList: number[] = new Array(yList.length)
      .fill(null)
      .map((val: number, index: number) => index + 1);
    return yList.reduce((g: number, fi: number, index: number) => {
      return g + fi * getVi(xList, index)(x);
    }, 0);
  };
};

const parseRow: (line: string) => Row = (line: string) => {
  const values: number[] = ParsingUtils.parseNumberString(line, true);
  return { values, polynomial: getG(values) };
};

const parseFile: (filename: string) => Row[] = (filename: string) => {
  return FileUtils.mapFileToList(__dirname, filename, parseRow);
};

// The use of math.round here is frankly a guess, but luckily works. I guess my inmplementation above isn't great
// or something wrong with my numbers by hey ho
const solvePart1: (filename: string) => number = (filename: string) => {
  return parseFile(filename).reduce(
    (total: number, row: Row) =>
      total + Math.round(row.polynomial(row.values.length + 1)),
    0,
  );
};

const solvePart2: (filename: string) => number = (filename: string) => {
  return parseFile(filename).reduce(
    (total: number, row: Row) => total + Math.round(row.polynomial(0)),
    0,
  );
};

console.log("Example Part 1: ", solvePart1("example.txt"));

console.log("Part 1: ", solvePart1("input.txt"));

console.log("Example Part 2: ", solvePart2("example.txt"));

console.log("Part 2: ", solvePart2("input.txt"));
