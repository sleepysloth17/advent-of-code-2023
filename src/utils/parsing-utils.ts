export class ParsingUtils {
  public static parseNumberString(value: string): number[] {
    return Array.from(value.matchAll(new RegExp("(\\d+)", "g"))).map(
      (match: RegExpMatchArray) => +match[0],
    );
  }
}
