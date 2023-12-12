import { FileUtils } from "../utils/file-utils";
import { ParsingUtils } from "../utils/parsing-utils";

interface SpringRecord {
  value: string;
  groups: number[];
}

const parseSpringRecord: (line: string) => SpringRecord = (line: string) => {
  const [value, groupValue]: string[] = line.split(" ");
  return {
    value: value,
    groups: ParsingUtils.parseNumberString(groupValue),
  };
};

const parseUnfoldedSpringRecord: (line: string) => SpringRecord = (
  line: string,
) => {
  const [value, groupValue]: string[] = line.split(" ");
  const groups: number[] = ParsingUtils.parseNumberString(groupValue);
  return {
    value: new Array(5).fill(value).join("?"),
    groups: new Array(5).fill(groups).flatMap((g) => g),
  };
};

const getRecords: (filename: string) => SpringRecord[] = (filename: string) => {
  return FileUtils.mapFileToList(__dirname, filename, parseSpringRecord);
};

const getUnfoldedRecords: (filename: string) => SpringRecord[] = (
  filename: string,
) => {
  return FileUtils.mapFileToList(
    __dirname,
    filename,
    parseUnfoldedSpringRecord,
  );
};

const countArrangments: (
  value: string,
  groups: number[],
  leftInCurrentGroup: number,
  cache: Record<string, number>,
) => number = (
  value: string,
  groups: number[],
  leftInCurrentGroup: number,
  cache: Record<string, number>,
) => {
  const cacheKey: string = `${value}-${groups.join("")}-${leftInCurrentGroup}`;

  if (cacheKey in cache) {
    return cache[cacheKey];
  }

  let count: number = 0;

  if (!value) {
    // The string is finished, we want to see that the most recent group is solved.
    // We need to check group length 0 and 1, as 0 is if the last character is a .
    // and thus the group has been popped off, and 1 is if the last is a # and thus
    // we have yet to remove that group from the list to check
    return !leftInCurrentGroup && groups.length < 2 ? 1 : 0;
  }

  switch (value[0]) {
    case "#":
      // We mark this spring as being in the current group, and continue
      count += countArrangments(
        value.slice(1),
        groups,
        leftInCurrentGroup - 1,
        cache,
      );
      break;
    case ".":
      // Check if either the current group if completed, hasn't been started, or failed.
      // - If completed, we want to go to the next group
      // - If hasn't been started, continue
      // - If neither of the above, we want to do nothing: this group failed and the record can't be filled
      switch (leftInCurrentGroup) {
        case 0:
          // Current group done! Start a new group if one exists
          count += countArrangments(
            value.slice(1),
            groups.slice(1),
            groups.length - 1 > 0 ? groups[1] : 0,
            cache,
          );
          break;
        case groups[0]:
          // We're checking a new group and haven't yet actually started it, thus can continue
          count += countArrangments(
            value.slice(1),
            groups,
            leftInCurrentGroup,
            cache,
          );
          break;
        default:
          // The previous group was started but cannot be finished: we don't want to continue
          break;
      }
      break;
    case "?":
      // Try both potential paths by changing the current char and just running this again
      // It means in the actual logic above, we can basically ignore ?
      count += countArrangments(
        `.${value.slice(1)}`,
        groups,
        leftInCurrentGroup,
        cache,
      );
      count += countArrangments(
        `#${value.slice(1)}`,
        groups,
        leftInCurrentGroup,
        cache,
      );
      break;
    default:
      throw new Error("Invalid character");
  }

  cache[cacheKey] = count;

  return count;
};

const sumArrangementCounts: (filename: string) => number = (
  filename: string,
) => {
  return getRecords(filename).reduce(
    (total: number, record: SpringRecord) =>
      total +
      countArrangments(record.value, record.groups, record.groups[0], {}),
    0,
  );
};

const sumUnfoldedArrangementCounts: (filename: string) => number = (
  filename: string,
) => {
  return getUnfoldedRecords(filename).reduce(
    (total: number, record: SpringRecord) =>
      total +
      countArrangments(record.value, record.groups, record.groups[0], {}),
    0,
  );
};

console.log("Example Part 1: ", sumArrangementCounts("example.txt"));

console.log("Part 1: ", sumArrangementCounts("input.txt"));

console.log("Example Part 2: ", sumUnfoldedArrangementCounts("example.txt"));

console.log("Part 2: ", sumUnfoldedArrangementCounts("input.txt"));
