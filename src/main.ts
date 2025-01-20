import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { Observer } from './observer/Observer.js';
import { ENV } from './common/common.module.js';
import { Env } from './common/env.js';
import { log } from 'jslog';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const env = app.get<Env>(ENV);
  if (env.nodeEnv !== 'prod') {
    log.info('Env', env);
  }

  const observer = app.get(Observer);
  observer.observe();

  await app.listen(env.appPort);
}

bootstrap();
