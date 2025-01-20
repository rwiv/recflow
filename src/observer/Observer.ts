import { CheckerChzzk } from './checker.chzzk.js';
import { CheckerSoop } from './checker.soop.js';
import { Injectable } from '@nestjs/common';

@Injectable()
export class Observer {
  private curInterval: NodeJS.Timeout | undefined;
  private isObserving: boolean = false;
  private readonly checkCycle: number = 5 * 1000;

  constructor(
    private readonly chzzkChacker: CheckerChzzk,
    private readonly soopChecker: CheckerSoop,
  ) {}

  observe() {
    if (this.isObserving) {
      throw Error('already observing');
    }

    this.chzzkChacker.check();
    this.soopChecker.check();
    this.curInterval = setInterval(async () => {
      await this.chzzkChacker.check();
      await this.soopChecker.check();
    }, this.checkCycle);

    this.isObserving = true;
  }

  stop() {
    clearInterval(this.curInterval);
    this.curInterval = undefined;
    this.isObserving = false;
  }
}
