import { readFileSync } from "fs";
import { join } from "path";

export class FileUtils {
  public static readLines(
    dir: string,
    filename: string,
    filterBlank: boolean = true,
  ): string[] {
    const path: string = join(dir, filename);
    return readFileSync(path, "utf-8")
      .split(/\r?\n/)
      .filter((l) => !filterBlank || Boolean(l));
  }

  public static mapFileToList<T>(
    dir: string,
    filename: string,
    mappingFunction: (line: string, index?: number) => T,
    filterBlank: boolean = true,
  ): T[] {
    return FileUtils.readLines(dir, filename, filterBlank).map(mappingFunction);
  }
}
