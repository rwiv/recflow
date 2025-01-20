import express, {Request, Response, NextFunction} from "express";
import {log} from "jslog";
import {Env} from "../common/env.js";
import {QueryConfig} from "../common/query.js";
import {DepManager} from "../common/DepManager.js";
import {Observer} from "../observer/Observer.js";
import path from "path";

export class AppRunner {

  private dep: DepManager;
  private observer: Observer;
  private server: Server;

  constructor(
    private readonly env: Env,
    private readonly query: QueryConfig,
  ) {
    this.dep = new DepManager(this.env, this.query);
    this.observer = new Observer(this.dep.chzzkChecker, this.dep.soopChecker);
    this.server = new Server(this.dep);
  }

  async run() {
    this.observer.observe();
    await this.server.start();
  }
}

class Server {

  constructor(private readonly dep: DepManager) {}

  async start() {
    const app = express();

    app.use(express.static("public"));
    app.use("/api", this.dep.mainRouter.router);

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

    app.listen(8080, () => {
      log.info("Server started at http://localhost:8080");
    });

    return app;
  }
}
