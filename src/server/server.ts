import express, {Request, Response, NextFunction} from "express";
import {log} from "jslog";
import {readEnv} from "../common/env.js";
import {readQueryConfig} from "../common/query.js";
import {DepManager} from "../common/DepManager.js";
import {Observer} from "../observer/Observer.js";
import {MainRouter} from "./main_router.js";
import path from "path";

export async function startServer() {
  const app = express();

  app.use(express.static("public"));
  app.use("/api", new MainRouter().router);

  app.get("/", (req: Request, res: Response) => {
    res.sendFile(path.join(path.resolve(), "public", "index.html"));
  });

  app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(404).send("Not Found");
  });

  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).send("Something broke!");
  });

  app.listen(8081, () => {
    log.info("Server started at http://localhost:8080");
  });

  const observer = await runObserver();

  return app;
}

export async function runObserver() {
  const env = readEnv();
  const query = await readQueryConfig(env.configPath);
  log.info("Env", env);
  // log.info("Config", query);

  // start observing
  const dep = new DepManager(env, query);
  const observer = new Observer(dep.chzzkChecker, dep.soopChecker);
  observer.observe();
  return observer;
}
