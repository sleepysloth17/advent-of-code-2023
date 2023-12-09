export class ParsingUtils {
  private static readonly NUMBER_REGEX: RegExp = new RegExp("(\\d+)", "g");
  private static readonly NUMBER_REGEX_WITH_NEGATIVE: RegExp = new RegExp(
    "(-?\\d+)",
    "g",
  );

  public static parseNumberString(
    value: string,
    inclueNegatives: boolean = false,
  ): number[] {
    return Array.from(
      value.matchAll(
        inclueNegatives
          ? ParsingUtils.NUMBER_REGEX_WITH_NEGATIVE
          : ParsingUtils.NUMBER_REGEX,
      ),
    ).map((match: RegExpMatchArray) => +match[0]);
  }
}
