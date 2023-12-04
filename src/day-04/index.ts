import { FileUtils } from "../utils/file-utils";

interface Card {
  id: number;
  winningNumbers: Set<number>;
  numbersYouHave: Set<number>;
  cardstoCopy: number[];
}

const parseCard: (line: string) => Card = (line: string) => {
  const splitCardName: string[] = line.split(": ");
  const splitNumberStrings: string[] = splitCardName[1].split(" | ");

  const id: number = +splitCardName[0].replace("Card ", "");
  const winningNumbers: Set<number> = getNumberSetFromString(
    splitNumberStrings[0],
  );
  const numbersYouHave: Set<number> = getNumberSetFromString(
    splitNumberStrings[1],
  );
  const cardstoCopy: number[] = [...numbersYouHave]
    .filter((n) => winningNumbers.has(n))
    .map((_: number, index: number) => id + index + 1);

  return {
    id,
    winningNumbers,
    numbersYouHave,
    cardstoCopy,
  };
};

const getNumberSetFromString: (value: string) => Set<number> = (
  value: string,
) => {
  const numbers: IterableIterator<RegExpMatchArray> = value.matchAll(
    new RegExp("(\\d+)", "g"),
  );
  const returnNumbers: number[] = [];
  for (const num of numbers) {
    returnNumbers.push(+num[0]);
  }
  return new Set(returnNumbers);
};

const getPointsForCardPart1: (card: Card) => number = (card: Card) => {
  const winners: number[] = [...card.numbersYouHave].filter((n) =>
    card.winningNumbers.has(n),
  );
  return winners.length ? 2 ** (winners.length - 1) : 0;
};

const getPointsPart1: (filename: string) => number = (filename: string) => {
  return FileUtils.mapFileToList(__dirname, filename, parseCard).reduce(
    (points: number, card: Card) => {
      return points + getPointsForCardPart1(card);
    },
    0,
  );
};

const handleCard: (
  copyMap: Record<number, number[]>,
  card: number,
) => number = (copyMap: Record<number, number[]>, card: number) => {
  return (
    1 +
    copyMap[card].reduce(
      (total: number, child: number) => total + handleCard(copyMap, child),
      0,
    )
  );
};

const getPointsPart2: (filename: string) => number = (filename: string) => {
  const cards: Card[] = FileUtils.mapFileToList(__dirname, filename, parseCard);
  const copyMap: Record<number, number[]> = cards.reduce(
    (returnMap: Record<number, number[]>, card: Card) => {
      returnMap[card.id] = card.cardstoCopy;
      return returnMap;
    },
    {},
  );

  let score: number = 0;

  for (const card of cards) {
    score += handleCard(copyMap, card.id);
  }

  return score;
};

console.log("Example Part 1: ", getPointsPart1("./example.txt"));

console.log("Part 1: ", getPointsPart1("./input.txt"));

console.log("Example Part 2: ", getPointsPart2("./example.txt"));

console.log("Part 2: ", getPointsPart2("./input.txt"));
