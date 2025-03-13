import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ENV } from './common/config/config.module.js';
import { Env } from './common/config/env.js';
import { DevInitializer } from './common/module/dev-initializer.js';
import { LiveTaskInitializer } from './task/live/live.task.initializer.js';
import { ChannelTaskInitializer } from './task/channel/channel.task.initializer.js';
import { ProdInitializer } from './common/module/prod-initializer.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const env = app.get<Env>(ENV);

  if (env.nodeEnv === 'prod') {
    await app.get(ProdInitializer).check();
  } else {
    app.enableCors();
    await app.get(DevInitializer).initDev();
  }

  app.get(LiveTaskInitializer).init();
  app.get(ChannelTaskInitializer).init();

  await app.listen(env.appPort);
}

bootstrap();
