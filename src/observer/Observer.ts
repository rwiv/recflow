import {ChzzkChecker} from "./ChzzkChecker.js";

export class Observer {

  private curInterval: NodeJS.Timeout | undefined;
  private isObserving: boolean = false;

  constructor(
    private readonly chzzkChacker: ChzzkChecker,
    private readonly checkCycle: number = 5 * 1000,
  ) {}

  observe() {
    if (this.isObserving) {
      throw Error("already observing");
    }

    this.chzzkChacker.check()
    this.curInterval = setInterval(async () => {
      await this.chzzkChacker.check();
    }, this.checkCycle);

    this.isObserving = true;
  }

  stop() {
    clearInterval(this.curInterval);
    this.curInterval = undefined;
    this.isObserving = false;
  }
}
