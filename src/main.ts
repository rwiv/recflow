import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { LiveScheduler } from './live/scheduler/scheduler.js';
import { ENV } from './common/config.module.js';
import { Env } from './common/env.js';
import { log } from 'jslog';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const env = app.get<Env>(ENV);
  if (env.nodeEnv !== 'prod') {
    log.info('Env', env);
    app.enableCors();
  }

  const scheduler = app.get(LiveScheduler);
  scheduler.run();

  await app.listen(env.appPort);
}

bootstrap();
