import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ENV } from './common/config/config.module.js';
import { Env } from './common/config/env.js';
import { log } from 'jslog';
import { DevInitializer } from './common/init/dev-initializer.js';
import { ProdInitializer } from './common/init/prod-initializer.js';
import { LiveTaskInitializer } from './task/live/live.task.initializer.js';
import { ChannelTaskInitializer } from './task/channel/channel.task.initializer.js';
import { NodeTaskInitializer } from './task/node/node.task.initializer.js';
import { LiveStreamTaskInitializer } from './task/live/live-stream.task.initializer.js';

async function bootstrap() {
  log.setLevel('debug');

  const app = await NestFactory.create(AppModule);

  const env = app.get<Env>(ENV);

  if (env.nodeEnv === 'prod') {
    await app.get(ProdInitializer).check();
  } else {
    app.enableCors();
    await app.get(DevInitializer).initDev();
  }

  // if (env.nodeEnv !== 'prod') {
  //   await app.get(TaskLockManager).releaseAll();
  // }

  app.get(ChannelTaskInitializer).init();
  app.get(NodeTaskInitializer).init();
  app.get(LiveTaskInitializer).init();
  app.get(LiveStreamTaskInitializer).init();

  await app.listen(env.appPort);
}

bootstrap();
