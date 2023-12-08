export class NumberUtils {
  public static lcm(...nums: number[]): number {
    return nums.reduce(
      (current: number, num: number) =>
        NumberUtils._lcmFromTwoInts(current, num),
      1,
    );
  }

  private static _lcmFromTwoInts(a: number, b: number): number {
    return (a * b) / NumberUtils.gcd(a, b);
  }

  public static gcd(a: number, b: number): number {
    return !b ? a : this.gcd(b, a % b);
  }

  private constructor() {}
}
