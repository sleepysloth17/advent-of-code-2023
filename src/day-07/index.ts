import { FileUtils } from "../utils/file-utils";

enum HandType {
  FIVE_OF_A_KIND,
  FOUR_OF_A_KIND,
  FULL_HOUSE,
  THREE_OF_A_KIND,
  TWO_PAIR,
  ONE_PAIR,
  HIGH_CARD,
}

interface HandAndBid {
  hand: Hand;
  bid: number;
}

const CARD_STRENGH_MAP: Record<string, number> = {
  A: 12,
  K: 11,
  Q: 10,
  J: 9,
  T: 8,
  "9": 7,
  "8": 6,
  "7": 5,
  "6": 4,
  "5": 3,
  "4": 2,
  "3": 1,
  "2": 0,
};

const JOKER_CARD_STRENGH_MAP: Record<string, number> = {
  A: 12,
  K: 11,
  Q: 10,
  T: 9,
  "9": 8,
  "8": 7,
  "7": 6,
  "6": 5,
  "5": 4,
  "4": 3,
  "3": 2,
  "2": 1,
  J: 0,
};

class Hand {
  public static parse(value: string, withJokers: boolean): Hand {
    const cardMap: Record<string, number> = [...value].reduce(
      (returnMap: Record<string, number>, card: string) => {
        if (returnMap[card]) {
          returnMap[card] += 1;
        } else {
          returnMap[card] = 1;
        }
        return returnMap;
      },
      {},
    );

    if (withJokers) {
      const numJokers: number = cardMap["J"] || 0;
      delete cardMap["J"];

      if (!Object.keys(cardMap).length) {
        return new Hand(value, HandType.FIVE_OF_A_KIND);
      }

      Object.keys(cardMap).forEach(
        (card: string) => (cardMap[card] += numJokers),
      );
    }

    return this._parseHand(value, cardMap);
  }

  private static _parseHand(
    value: string,
    cardMap: Record<string, number>,
  ): Hand {
    const cardSet: Set<string> = new Set(Object.keys(cardMap));
    const countSet: Set<number> = new Set(Object.values(cardMap));

    switch (cardSet.size) {
      case 1:
        // FIVE_OF_A_KIND
        return new Hand(value, HandType.FIVE_OF_A_KIND);
      case 2:
        // FOUR_OF_A_KIND,
        // FULL_HOUSE,
        return new Hand(
          value,
          countSet.has(4) ? HandType.FOUR_OF_A_KIND : HandType.FULL_HOUSE,
        );
      case 3:
        // THREE_OF_A_KIND,
        // TWO_PAIR
        return new Hand(
          value,
          countSet.has(3) ? HandType.THREE_OF_A_KIND : HandType.TWO_PAIR,
        );
      case 4:
        // ONE_PAIR
        return new Hand(value, HandType.ONE_PAIR);
      case 5:
        // HIGH_CARD
        return new Hand(value, HandType.HIGH_CARD);
      default:
        throw new Error(`Invalid Hand ${value}`);
    }
  }

  private readonly _strengthList: number[];
  private readonly _jokerStrengthList: number[];

  constructor(
    _value: string,
    private readonly _handType: HandType,
  ) {
    this._strengthList = [..._value].map((c: string) => CARD_STRENGH_MAP[c]);
    this._jokerStrengthList = [..._value].map(
      (c: string) => JOKER_CARD_STRENGH_MAP[c],
    );
  }

  public compareTo(other: Hand, includeJokers: boolean): number {
    const comparenumber: number = other._handType - this._handType;

    if (comparenumber) {
      return comparenumber;
    }

    return includeJokers
      ? this._compareStrength(this._jokerStrengthList, other._jokerStrengthList)
      : this._compareStrength(this._strengthList, other._strengthList);
  }

  private _compareStrength(
    thisStrenghList: number[],
    otherStrengthList: number[],
  ): number {
    for (let i = 0; i < thisStrenghList.length; i++) {
      const compareStrength: number = thisStrenghList[i] - otherStrengthList[i];
      if (compareStrength) {
        return compareStrength;
      }
    }

    return 0;
  }
}

const parseHandAndBid: (line: string, includeJokers: boolean) => HandAndBid = (
  line: string,
  includeJokers: boolean,
) => {
  const [handString, ...bidString] = line.split(" ");
  return {
    hand: Hand.parse(handString, includeJokers),
    bid: +bidString[0],
  };
};

const countWinnings: (filename: string, includeJokers: boolean) => number = (
  filename: string,
  includeJokers: boolean,
) => {
  return FileUtils.mapFileToList(__dirname, filename, (line: string) =>
    parseHandAndBid(line, includeJokers),
  )
    .sort((a, b) => a.hand.compareTo(b.hand, includeJokers))
    .reduce(
      (winnings: number, handAndBid: HandAndBid, index: number) =>
        winnings + handAndBid.bid * (index + 1),
      0,
    );
};

console.log("Example Part 1: ", countWinnings("example.txt", false));

console.log("Part 1: ", countWinnings("input.txt", false));

console.log("Example Part 2: ", countWinnings("example.txt", true));

console.log("Part 2: ", countWinnings("input.txt", true));
