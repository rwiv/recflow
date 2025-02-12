import { Injectable } from '@nestjs/common';
import { CriteriaBatchInsert } from '../batch.config.js';
import { log } from 'jslog';
import { CriterionWriter } from '../../criterion/service/criterion.writer.js';
import {
  chzzkCriterionAppend,
  ChzzkCriterionAppend,
  SoopCriterionAppend,
} from '../../criterion/spec/criterion.dto.schema.js';
import { PlatformFinder } from '../../platform/storage/platform.finder.js';

@Injectable()
export class CriterionBatchInserter {
  constructor(
    private readonly criterionWriter: CriterionWriter,
    private readonly pfFinder: PlatformFinder,
  ) {}

  async insert(req: CriteriaBatchInsert) {
    const chzzkPlatform = await this.pfFinder.findByNameNotNull('chzzk');
    const soopPlatform = await this.pfFinder.findByNameNotNull('soop');
    for (const chzzk of req.chzzk) {
      const append: ChzzkCriterionAppend = { ...chzzk, platformId: chzzkPlatform.id };
      const parsed = chzzkCriterionAppend.parse(append);
      const created = await this.criterionWriter.createChzzkCriterion(parsed);
      log.info(`Inserted criterion: ${created.name}`);
    }
    for (const soop of req.soop) {
      const append: SoopCriterionAppend = { ...soop, platformId: soopPlatform.id };
      const created = await this.criterionWriter.createSoopCriterion(append);
      log.info(`Inserted criterion: ${created.name}`);
    }
  }
}
