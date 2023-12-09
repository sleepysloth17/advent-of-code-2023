import { writeFile } from "fs";
import { IncomingMessage } from "http";
import https from "https";
import jsdom from "jsdom";
import { join } from "path";

const year: number = +process.argv[2];
const day: number = +process.argv[3];
const dir: string = process.argv[4];

const options = {
  hostname: "adventofcode.com",
  path: `/${year}/day/${day}`,
  headers: {
    "Content-Type": "text/html",
  },
};

const getExampleText: (requestOptions: object) => Promise<string> = (
  requestOptions: object,
) => {
  return new Promise(
    (resolve: (value: string) => void, reject: (err: Error) => void) => {
      https
        .get(requestOptions, (res: IncomingMessage) => {
          let result: string = "";
          res.on("data", (chunk: string) => {
            result += chunk;
          });

          res.on("end", () => {
            const dom: jsdom.JSDOM = new jsdom.JSDOM(result);
            const article: Element =
              dom.window.document.getElementsByClassName("day-desc")[0];

            let maybeExample: boolean = false;
            for (const articleChild of article.childNodes) {
              if (articleChild.nodeName === "P") {
                maybeExample = articleChild.textContent.includes("xample");
              } else if (maybeExample && articleChild.nodeName === "PRE") {
                resolve(articleChild.textContent);
              }
            }

            reject(new Error("Could not find example text"));
          });
        })
        .on("error", reject);
    },
  );
};

const writeToFile: (content: string, location: string) => void = (
  content: string,
  location: string,
) => {
  writeFile(join(location, "example.txt"), content, (err) => {
    if (err) {
      console.error(err);
    }
  });
};

getExampleText(options)
  .then((exampleText: string) => writeToFile(exampleText, dir))
  .catch(console.error);
