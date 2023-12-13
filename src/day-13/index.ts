import { FileUtils } from "../utils/file-utils";

interface Pattern {
  rows: string[];
  alternativeRows: string[][];
  columns: string[];
  alternativeColumns: string[][];
}

const buildPattern: (rows: string[]) => Pattern = (rows: string[]) => {
  const columns: string[] = rows.reduce((columns: string[], row: string) => {
    for (let i = 0; i < row.length; i++) {
      if (columns[i]) {
        columns[i] += row[i];
      } else {
        columns[i] = row[i];
      }
    }
    return columns;
  }, []);
  return {
    rows,
    columns,
    alternativeRows: getAlternatives(rows),
    alternativeColumns: getAlternatives(columns),
  };
};

const getAlternatives: (arr: string[]) => string[][] = (arr: string[]) => {
  const returnArr: string[][] = [];
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr[i].length; j++) {
      const newArr: string[] = [...arr];
      const newRow: string[] = newArr[i].split("");
      newRow[j] = newRow[j] === "#" ? "." : "#";
      newArr[i] = newRow.join("");
      returnArr.push(newArr);
    }
  }
  return returnArr;
};

const parseFile: (filename: string) => Pattern[] = (filename: string) => {
  const lines: string[] = FileUtils.readLines(__dirname, filename, false);

  const patterns: Pattern[] = [];

  let currentRows: string[] = [];
  for (const line of lines) {
    if (line) {
      currentRows.push(line);
    } else {
      patterns.push(buildPattern(currentRows));
      currentRows = [];
    }
  }

  if (currentRows.length) {
    patterns.push(buildPattern(currentRows));
  }

  return patterns;
};

const testMirrors: (before: string[], after: string[]) => boolean = (
  before: string[],
  after: string[],
) => {
  const beforeString: string = before.join(",") + ",";
  const afterString: string = after.join(",") + ",";
  return (
    beforeString.startsWith(afterString) || afterString.startsWith(beforeString)
  );
};

const findFoldingPoint: (values: string[], ignore: number) => number = (
  values: string[],
  ignore: number,
) => {
  for (let i = 1; i < values.length; i++) {
    if (
      values[i] === values[i - 1] &&
      testMirrors(values.slice(0, i).reverse(), values.slice(i, values.length))
    ) {
      if (!ignore || i !== ignore) {
        return i;
      }
    }
  }
  return null;
};

const findValueForPatternPart1: (pattern: Pattern) => number = (
  pattern: Pattern,
) => {
  const rowFoldingPoint: number = findFoldingPoint(pattern.rows, null);
  if (rowFoldingPoint) {
    return rowFoldingPoint * 100;
  }
  const columnFoldingPoint: number = findFoldingPoint(pattern.columns, null);
  return columnFoldingPoint;
};

const findValueForPatternPart2: (pattern: Pattern) => number = (
  pattern: Pattern,
) => {
  const rowMatch: number = findFoldingPoint(pattern.rows, null);
  for (const row of [...pattern.alternativeRows]) {
    const rowFoldingPoint: number = findFoldingPoint(row, rowMatch);
    if (rowFoldingPoint) {
      return rowFoldingPoint * 100;
    }
  }

  const colMatch: number = findFoldingPoint(pattern.columns, null);
  for (const col of [...pattern.alternativeColumns]) {
    const columnFoldingPoint: number = findFoldingPoint(col, colMatch);
    if (columnFoldingPoint) {
      return columnFoldingPoint;
    }
  }

  throw new Error("\n" + pattern.rows.join("\n"));
};

const sumFoldingPointsPart1: (filename: string) => number = (
  filename: string,
) => {
  return parseFile(filename).reduce(
    (total: number, pattern: Pattern) =>
      total + findValueForPatternPart1(pattern),
    0,
  );
};

const sumFoldingPointsPart2: (filename: string) => number = (
  filename: string,
) => {
  return parseFile(filename).reduce(
    (total: number, pattern: Pattern) =>
      total + findValueForPatternPart2(pattern),
    0,
  );
};

console.log("Example Part 1: ", sumFoldingPointsPart1("example.txt"));
console.log("Part 1: ", sumFoldingPointsPart1("input.txt"));

console.log("Example Part 2: ", sumFoldingPointsPart2("example.txt"));
console.log("Part 2: ", sumFoldingPointsPart2("input.txt"));
