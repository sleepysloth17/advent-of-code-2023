import { FileUtils } from "../utils/file-utils";

enum Category {
  seed = "seed",
  soil = "soil",
  fertilizer = "fertilizer",
  water = "water",
  light = "light",
  temperature = "temperature",
  humidity = "humidity",
}

interface Almanac<T> {
  seeds: T;
  maps: Record<Category, AlmanacMap>;
}

class AlmanacMap {
  private readonly _rangeList: Range[] = [];
  private readonly _lowerBoundSourceToDestinationMap: Record<number, number> =
    {};

  constructor() {}

  public put(sourceStart: number, range: number, destinationStart: number) {
    this._rangeList.push(new Range(sourceStart, range));
    this._lowerBoundSourceToDestinationMap[sourceStart] = destinationStart;
  }

  public get(num: number): number {
    const containingRange: Range = this._rangeList.find(
      (range: Range) => range.lowerBound <= num && range.upperBound >= num,
    );

    if (!containingRange) {
      return num;
    }

    return (
      num -
      containingRange.lowerBound +
      this._lowerBoundSourceToDestinationMap[containingRange.lowerBound]
    );
  }

  public getRange(ranges: Range[]): Range[] {
    return ranges.flatMap((range: Range) => {
      const intersectingRanges: Range[] = this._rangeList.filter(
        (_range: Range) => {
          return _range.intersects(range);
        },
      );
      return this._splitRanges(range, intersectingRanges).map(
        (joined: { mappingRange: Range; range: Range }) => {
          if (!joined.mappingRange) {
            return range;
          }
        },
      );
    });
  }

  private _splitRanges(
    toSplit: Range,
    toSplitOn: Range[],
  ): { mappingRange: Range; range: Range }[] {
    return [];
  }
}

const getMap: <T>(
  filename: string,
  seedParser: (line: string) => T,
) => Almanac<T> = <T>(filename: string, seedParser: (line: string) => T) => {
  const fileLines: string[] = FileUtils.readLines(__dirname, filename, true);

  const maps: Record<Category, AlmanacMap> = Object.keys(Category).reduce(
    (returnMap: Record<Category, AlmanacMap>, category: string) => {
      returnMap[category] = new AlmanacMap();
      return returnMap;
    },
    {} as Record<Category, AlmanacMap>,
  );
  let fromType: Category;
  let seeds: T;

  for (const line of fileLines) {
    if (line.startsWith("seeds: ")) {
      seeds = seedParser(line);
      continue;
    } else if (line.endsWith("map:")) {
      fromType = Category[line.split("-")[0] as keyof Category];
      continue;
    } else if (line) {
      const num: number[] = handleNumberString(line);
      const destinationRangeStart: number = num[0];
      const sourceRangeStart: number = num[1];
      const rangeLength: number = num[2];

      maps[fromType].put(sourceRangeStart, rangeLength, destinationRangeStart);
    }
  }

  return {
    seeds,
    maps,
  };
};

const parseSeedsPart1: (seedLine: string) => number[] = (seedLine: string) => {
  return handleNumberString(seedLine.replace("seeds: ", ""));
};

class Range {
  public readonly upperBound: number;

  constructor(
    public readonly lowerBound: number,
    public readonly length: number,
  ) {
    this.upperBound = lowerBound + length;
  }

  public intersects(other: Range): boolean {
    return (
      this.lowerBound <= other.upperBound && other.lowerBound <= this.upperBound
    );
  }
}

const parseSeedsPart2: (seedLine: string) => Range[] = (seedLine: string) => {
  const seedProperties: number[] = handleNumberString(
    seedLine.replace("seeds: ", ""),
  );

  const returnList: Range[] = [];

  for (let i = 0; i < seedProperties.length - 1; i += 2) {
    returnList.push(new Range(seedProperties[i], seedProperties[i + 1]));
  }

  return returnList;
};

const handleNumberString: (value: string) => number[] = (value: string) => {
  return Array.from(value.matchAll(new RegExp("(\\d+)", "g"))).map(
    (match: RegExpMatchArray) => +match[0],
  );
};
const handleSeedsPart1: (almanac: Almanac<number[]>) => number[] = (
  almanac: Almanac<number[]>,
) => {
  return almanac.seeds.map((seed) =>
    Object.keys(Category).reduce(
      (location: number, key: string) => almanac.maps[key].get(location),
      seed,
    ),
  );
};

const handleSeedsPart2: (almanac: Almanac<Range[]>) => number[] = (
  almanac: Almanac<Range[]>,
) => {
  return almanac.seeds.flatMap((seedRange: Range) => {
    const ranges: Range[] = Object.keys(Category).reduce(
      (ranges: Range[], key: string) => almanac.maps[key].getRange(ranges),
      [seedRange],
    );
    return ranges.flatMap((range: Range) =>
      new Array(range.length).fill(range.lowerBound).map((a, i) => a + i),
    );
  });
};

const getLowestLocationNumber: <T>(
  filename: string,
  seedParser: (line: string) => T,
  seedHandler: (almanac: Almanac<T>) => number[],
) => number = <T>(
  filename: string,
  seedParser: (line: string) => T,
  seedHandler: (almanac: Almanac<T>) => number[],
) => {
  const almanac: Almanac<T> = getMap(filename, seedParser);
  return Math.min(...seedHandler(almanac));
};

console.log(
  "Example Part 1: ",
  getLowestLocationNumber("example.txt", parseSeedsPart1, handleSeedsPart1),
);

console.log(
  "Part 1: ",
  getLowestLocationNumber("input.txt", parseSeedsPart1, handleSeedsPart1),
);

console.log(
  "Example Part 2: ",
  getLowestLocationNumber("example.txt", parseSeedsPart2, handleSeedsPart2),
);

// console.log(
//   "Part 2: ",
//   getLowestLocationNumber("input.txt", parseSeedsPart2, handleSeedsPart2),
// );
