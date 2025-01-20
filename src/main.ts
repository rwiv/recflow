import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { DepManager } from './common/DepManager.js';
import { Observer } from './observer/Observer.js';
import { readEnv } from './common/env.js';
import { readQueryConfig } from './common/query.js';
import { log } from 'jslog';

async function bootstrap() {
  const env = readEnv();
  const query = readQueryConfig(env.configPath);

  log.info('Env', env);
  // log.info('Config', query);

  const dep = new DepManager(env, query);
  const observer = new Observer(dep.chzzkChecker, dep.soopChecker);
  observer.observe();

  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
