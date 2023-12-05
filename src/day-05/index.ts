import { FileUtils } from "../utils/file-utils";
import { ParsingUtils } from "../utils/parsing-utils";

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

interface RangeEnd {
  range: Range;
  start: boolean;
  value: number;
}

class Range {
  public readonly upperBound: number;

  constructor(
    public readonly lowerBound: number,
    public readonly length: number,
  ) {
    this.upperBound = lowerBound + length - 1;
  }

  public split(num: RangeEnd): [Range, Range] {
    if (num.start) {
      return [
        new Range(this.lowerBound, num.value - this.lowerBound),
        new Range(num.value, this.upperBound - num.value + 1),
      ];
    } else {
      return [
        new Range(this.lowerBound, num.value - this.lowerBound + 1),
        new Range(num.value + 1, this.upperBound - num.value),
      ];
    }
  }

  public mapLowerBoundTo(num: number): Range {
    return new Range(num, this.length);
  }

  public contains(num: number): boolean {
    return this.lowerBound <= num && this.upperBound >= num;
  }

  public intersects(other: Range): boolean {
    return (
      this.lowerBound <= other.upperBound && other.lowerBound <= this.upperBound
    );
  }
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

  public mapNum(num: number): number {
    const containingRange: Range = this._rangeList.find((range: Range) =>
      range.contains(num),
    );

    if (!containingRange) {
      return num;
    }

    return (
      this._lowerBoundSourceToDestinationMap[containingRange.lowerBound] -
      containingRange.lowerBound +
      num
    );
  }

  public mapRanges(ranges: Range[]): Range[] {
    return ranges.flatMap((range: Range) => {
      const intersectingRanges: Range[] = this._rangeList.filter(
        (_range: Range) => {
          return _range.intersects(range);
        },
      );
      return intersectingRanges.length
        ? this._mapRange(intersectingRanges, range)
        : range;
    });
  }

  private _mapRange(sources: Range[], toMap: Range): Range[] {
    const ends: RangeEnd[] = sources
      .flatMap((range: Range) => [
        { range, start: true, value: range.lowerBound },
        { range, start: false, value: range.upperBound },
      ])
      .sort((a, b) =>
        a.value - b.value ? a.value - b.value : a.start ? -1 : 1,
      );

    const returnRanges: Range[] = [];
    let currentRange: Range = toMap;

    for (const end of ends) {
      if (currentRange.length && currentRange.contains(end.value)) {
        const split: [Range, Range] = currentRange.split(end);
        const firstPartOfSplit: Range = split[0];

        if (firstPartOfSplit.length > 0) {
          returnRanges.push(
            end.start
              ? firstPartOfSplit
              : firstPartOfSplit.mapLowerBoundTo(
                  this._lowerBoundSourceToDestinationMap[end.range.lowerBound] -
                    end.range.lowerBound +
                    firstPartOfSplit.lowerBound,
                ),
          );
        }

        currentRange = split[1];
      }
    }

    if (currentRange.length > 0) {
      if (currentRange.contains(ends.at(-1).value)) {
        returnRanges.push(currentRange);
      } else {
        returnRanges.push(
          currentRange.mapLowerBoundTo(this.mapNum(currentRange.lowerBound)),
        );
      }
    }

    return returnRanges;
  }
}

const getMap: <T>(
  filename: string,
  seedParser: (line: string) => T,
) => Almanac<T> = <T>(filename: string, seedParser: (line: string) => T) => {
  const fileLines: string[] = FileUtils.readLines(__dirname, filename);

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
    } else if (line.endsWith("map:")) {
      fromType = Category[line.split("-")[0] as keyof Category];
    } else if (line) {
      const num: number[] = ParsingUtils.parseNumberString(line);
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
  return ParsingUtils.parseNumberString(seedLine.replace("seeds: ", ""));
};

const parseSeedsPart2: (seedLine: string) => Range[] = (seedLine: string) => {
  const seedProperties: number[] = ParsingUtils.parseNumberString(
    seedLine.replace("seeds: ", ""),
  );

  const returnList: Range[] = [];

  for (let i = 0; i < seedProperties.length - 1; i += 2) {
    returnList.push(new Range(seedProperties[i], seedProperties[i + 1]));
  }

  return returnList;
};

const handleSeedsPart1: (almanac: Almanac<number[]>) => number[] = (
  almanac: Almanac<number[]>,
) => {
  return almanac.seeds.map((seed) =>
    Object.values(almanac.maps).reduce(
      (location: number, almamacMap: AlmanacMap) => almamacMap.mapNum(location),
      seed,
    ),
  );
};

const handleSeedsPart2: (almanac: Almanac<Range[]>) => number[] = (
  almanac: Almanac<Range[]>,
) => {
  return almanac.seeds.map(
    (seedRange: Range) =>
      Object.values(almanac.maps)
        .reduce(
          (returnRanges: Range[], almanacMap: AlmanacMap) =>
            almanacMap.mapRanges(returnRanges),
          [seedRange],
        )
        .sort((a, b) => a.lowerBound - b.lowerBound)[0].lowerBound,
  );
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

console.log(
  "Part 2: ",
  getLowestLocationNumber("input.txt", parseSeedsPart2, handleSeedsPart2),
);
