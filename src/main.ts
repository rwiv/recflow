import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ENV } from './common/config/config.module.js';
import { Env } from './common/config/env.js';
import { AppInitializer } from './common/module/initializer.js';
import { LiveTaskInitializer } from './task/live/live.task.initializer.js';
import { ChannelTaskInitializer } from './task/channel/channel.task.initializer.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const env = app.get<Env>(ENV);
  const init = app.get(AppInitializer);

  if (env.nodeEnv !== 'prod') {
    app.enableCors();
    await init.initDev();
  }

  app.get(LiveTaskInitializer).init();
  app.get(ChannelTaskInitializer).init();

  await app.listen(env.appPort);
}

bootstrap();
