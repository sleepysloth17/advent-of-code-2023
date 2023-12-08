import { FileUtils } from "../utils/file-utils";
import { ParsingUtils } from "../utils/parsing-utils";

interface Round {
  time: number;
  recordDistance: number;
}

const parseRoundsPart1: (filename: string) => Round[] = (filename: string) => {
  const parsedLines: number[][] = FileUtils.mapFileToList(
    __dirname,
    filename,
    (line: string) => ParsingUtils.parseNumberString(line),
  );

  return parsedLines[0].map((time: number, index: number) => ({
    time,
    recordDistance: parsedLines[1][index],
  }));
};

const parseRoundsPart2: (filename: string) => Round[] = (filename: string) => {
  const parsedLines: number[][] = FileUtils.mapFileToList(
    __dirname,
    filename,
    (line: string) => ParsingUtils.parseNumberString(line.replace(/\s+/g, "")),
  );

  return parsedLines[0].map((time: number, index: number) => ({
    time,
    recordDistance: parsedLines[1][index],
  }));
};

const getNumberOfRecordBeatingTimes: (round: Round) => number = (
  round: Round,
) => {
  const smallest: number =
    Math.floor(
      (round.time - (-4 * round.recordDistance + round.time ** 2) ** 0.5) / 2,
    ) + 1;
  const biggest: number =
    Math.ceil(
      (round.time + (-4 * round.recordDistance + round.time ** 2) ** 0.5) / 2,
    ) - 1;
  return biggest - smallest + 1;
};

const solvePart1: (filename: string) => number = (filename: string) => {
  return parseRoundsPart1(filename).reduce(
    (total: number, currentRound: Round) =>
      total * getNumberOfRecordBeatingTimes(currentRound),
    1,
  );
};

const solvePart2: (filename: string) => number = (filename: string) => {
  return getNumberOfRecordBeatingTimes(parseRoundsPart2(filename)[0]);
};

console.log("Example Part 1: ", solvePart1("./example.txt"));

console.log("Part 1: ", solvePart1("./input.txt"));

console.log("Example Part 2: ", solvePart2("./example.txt"));

console.log("Part 2: ", solvePart2("./input.txt"));
