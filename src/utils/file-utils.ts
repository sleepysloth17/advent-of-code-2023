import { readFileSync } from "fs";
import { join } from "path";

export class FileUtils {
  public static mapFileToList<T>(
    dir: string,
    filename: string,
    mappingFunction: (line: string) => T,
  ): T[] {
    const path: string = join(dir, filename);
    return readFileSync(path, "utf-8")
      .split(/\r?\n/)
      .filter(Boolean)
      .map(mappingFunction);
  }
}
