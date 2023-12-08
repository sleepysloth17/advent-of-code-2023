import { FileUtils } from "../utils/file-utils";
import { NumberUtils } from "../utils/number-utils";

interface NetworkNode {
  id: string;
  left: string;
  right: string;
}

interface NetworkMap {
  directions: ("left" | "right")[];
  nodeMap: Record<string, NetworkNode>;
}

const parseNetworkMap: (filename: string) => NetworkMap = (
  filename: string,
) => {
  const directions: ("left" | "right")[] = [];
  const nodeMap: Record<string, NetworkNode> = {};

  FileUtils.readLines(__dirname, filename).forEach(
    (line: string, index: number) => {
      if (!index) {
        directions.push(
          ...line
            .split("")
            .map((val: string) => (val === "R" ? "right" : "left")),
        );
      } else {
        const [id, newNode]: [string, NetworkNode] = parseNetworkNode(line);
        nodeMap[id] = newNode;
      }
    },
  );

  return { directions, nodeMap };
};

const parseNetworkNode: (line: string) => [string, NetworkNode] = (
  line: string,
) => {
  const [id, rest]: string[] = line.split(" = ");
  const [left, right]: string[] = rest.replace(/\(|\)/g, "").split(", ");
  return [id, { id, left, right }];
};

const getMinNumberOfStepsToEnd: (
  networkMap: NetworkMap,
  startNode: NetworkNode,
  isEnd: (id: NetworkNode) => boolean,
) => number = (
  networkMap: NetworkMap,
  startNode: NetworkNode,
  isEnd: (id: NetworkNode) => boolean,
) => {
  let currentNode: NetworkNode = startNode;
  let count: number = 0;

  while (!isEnd(currentNode)) {
    const index: number = count % networkMap.directions.length;
    currentNode = networkMap.nodeMap[currentNode[networkMap.directions[index]]];
    count += 1;
  }

  return count;
};

const getNumberOfStepsPart1: (filename: string) => number = (
  filename: string,
) => {
  const networkMap: NetworkMap = parseNetworkMap(filename);
  return getMinNumberOfStepsToEnd(
    networkMap,
    networkMap.nodeMap["AAA"],
    (node: NetworkNode) => node.id === "ZZZ",
  );
};

const getNumberOfStepsToEndPart2: (filename: string) => number = (
  filename: string,
) => {
  const networkMap: NetworkMap = parseNetworkMap(filename);
  const allMinSteps: number[] = Object.values(networkMap.nodeMap)
    .filter((node: NetworkNode) => node.id.endsWith("A"))
    .map((startNode: NetworkNode) =>
      getMinNumberOfStepsToEnd(
        parseNetworkMap(filename),
        startNode,
        (node: NetworkNode) => node.id.endsWith("Z"),
      ),
    );
  return NumberUtils.lcm(...allMinSteps);
};

console.log("Example Part 1: ", getNumberOfStepsPart1("example.txt"));

console.log("Part 1: ", getNumberOfStepsPart1("input.txt"));

console.log("Example Part 2: ", getNumberOfStepsToEndPart2("example-2.txt"));

console.log("Part 2: ", getNumberOfStepsToEndPart2("input.txt"));
