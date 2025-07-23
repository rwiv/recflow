import { Module } from '@nestjs/common';
import { CriterionServiceModule } from '../../criterion/service/criterion.service.module.js';
import { LiveDataModule } from '../../live/data/live.data.module.js';
import { LiveRegisterModule } from '../../live/register/live.register.module.js';
import { TaskSchedulerModule } from '../schedule/task.schedule.module.js';
import { LiveTaskInitializer } from './live.task.initializer.js';
import { InfraModule } from '../../infra/infra.module.js';
import { LiveDetectionModule } from '../../live/detection/live.detection.module.js';
import { LiveCoordinateModule } from '../../live/coordinate/live.coordinate.module.js';

@Module({
  imports: [
    InfraModule,
    CriterionServiceModule,
    LiveDataModule,
    LiveRegisterModule,
    LiveDetectionModule,
    LiveCoordinateModule,
    TaskSchedulerModule,
  ],
  providers: [LiveTaskInitializer],
  exports: [LiveTaskInitializer],
})
export class LiveTaskModule {}
