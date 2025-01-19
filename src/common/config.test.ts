import {it} from "vitest";
import path from "node:path";
import {readQueryConfig} from "./query.js";

it("test", async () => {
  const filePath = path.resolve(import.meta.dirname, "..", "..", "helm", "conf.yaml");
  const conf = await readQueryConfig(filePath);
  console.log(conf);
});
