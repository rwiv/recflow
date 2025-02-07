import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { LiveScheduler } from './live/scheduler/scheduler.js';
import { ENV } from './common/config.module.js';
import { Env } from './common/env.js';
import { AppInitializer } from './common/initializer.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const env = app.get<Env>(ENV);
  const init = app.get(AppInitializer);

  if (env.nodeEnv !== 'prod') {
    app.enableCors();
    await init.initDev();
  } else {
    await init.initProd();
  }

  const scheduler = app.get(LiveScheduler);
  scheduler.run();

  await app.listen(env.appPort);
}

bootstrap();
