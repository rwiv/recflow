import express, {Request, Response} from "express";

export class MainRouter {

  public router: express.Router;

  constructor() {
    this.router = express.Router();
    this.router.get("/health", this.health);
  }

  health(req: Request, res: Response) {
    res.send("hello");
  }
}
