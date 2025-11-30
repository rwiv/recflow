import { Module } from '@nestjs/common';

import { InfraModule } from '@/infra/infra.module.js';

import { LiveStreamTaskInitializer } from '@/task/live/live-stream.task.initializer.js';
import { LiveTaskInitializer } from '@/task/live/live.task.initializer.js';
import { TaskSchedulerModule } from '@/task/schedule/task.schedule.module.js';

import { CriterionServiceModule } from '@/criterion/service/criterion.service.module.js';

import { LiveCoordinationModule } from '@/live/coord/live.coordination.module.js';
import { LiveDataModule } from '@/live/data/live.data.module.js';
import { LiveDetectionModule } from '@/live/detection/live.detection.module.js';
import { LiveRegisterModule } from '@/live/register/live.register.module.js';
import { LiveStreamModule } from '@/live/stream/live.stream.module.js';

@Module({
  imports: [
    TaskSchedulerModule,
    InfraModule,
    CriterionServiceModule,
    LiveDataModule,
    LiveRegisterModule,
    LiveDetectionModule,
    LiveCoordinationModule,
    LiveStreamModule,
  ],
  providers: [LiveTaskInitializer, LiveStreamTaskInitializer],
  exports: [LiveTaskInitializer, LiveStreamTaskInitializer],
})
export class LiveTaskModule {}
