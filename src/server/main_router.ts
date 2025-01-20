import express, {Request, Response} from "express";
import {ChzzkTargetRepository, SoopTargetRepository} from "../repository/types.js";
import {ChzzkAllocator} from "../observer/ChzzkAllocator.js";
import {SoopAllocator} from "../observer/SoopAllocator.js";
import {Streamq} from "../client/Streamq.js";

export class MainRouter {

  public router: express.Router;

  constructor(
    private readonly streamq: Streamq,
    private readonly chzzkTargets: ChzzkTargetRepository,
    private readonly soopTargets: SoopTargetRepository,
    private readonly chzzkAllocator: ChzzkAllocator,
    private readonly soopAllocator: SoopAllocator,
  ) {
    this.router = express.Router();

    this.router.get("/health", (req: Request, res: Response) => {
      res.send("hello");
    });

    this.router.get("/chzzk/lives", async (req: Request, res: Response) => {
      res.send(await this.chzzkTargets.all());
    });

    this.router.post("/chzzk/:channelId", async (req: Request, res: Response) => {
      const ls = await this.chzzkAllocator.allocate(await this.getChzzkLive(req));
      res.send(ls);
    });

    this.router.delete("/chzzk/:channelId", async (req: Request, res: Response) => {
      const ls = await this.chzzkAllocator.deallocate(await this.getChzzkLive(req));
      res.send(ls);
    });
  }

  private async getChzzkLive(req: Request) {
    const channelId = req.params.channelId;
    const live = (await this.streamq.getChzzkChannel(channelId, true)).liveInfo;
    if (!live) throw Error("Not found chzzkChannel.liveInfo");
    return live;
  }
}
