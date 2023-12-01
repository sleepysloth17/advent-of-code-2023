import { FileUtils } from "../utils/file-utils";

const numbers: string[] = [
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
];

function parse1(line: string): number {
  let firstInt: string = null;
  let lastInt: string = null;

  for (let i = 0; i < line.length; i++) {
    const char: string = line[i];
    if (/\d/.test(char)) {
      firstInt = firstInt === null ? char : firstInt;
      lastInt = char;
    }
  }

  return +`${firstInt}${lastInt}`;
}

function parse2(line: string): number {
  let firstInt: string = null;
  let lastInt: string = null;

  for (let i = 0; i < line.length; i++) {
    const char: string = line[i];
    if (/\d/.test(char)) {
      firstInt = firstInt === null ? char : firstInt;
      lastInt = char;
    } else {
      const index: number = numbers.findIndex((n) =>
        line.slice(i, line.length).startsWith(n),
      );
      if (index > -1) {
        firstInt = `${firstInt === null ? index + 1 : firstInt}`;
        lastInt = `${index + 1}`;
      }
    }
  }

  return +`${firstInt}${lastInt}`;
}

function sum(filename: string, parse: (line: string) => number): number {
  return FileUtils.mapFileToList(__dirname, filename, parse).reduce(
    (a, b) => a + b,
    0,
  );
}

console.log("Part 1: ", sum("./input.txt", parse1));
console.log("Part 2: ", sum("./input.txt", parse2));
