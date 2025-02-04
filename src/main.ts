import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { LiveScheduler } from './live/scheduler/scheduler.js';
import { ENV } from './common/config.module.js';
import { Env } from './common/env.js';
import { log } from 'jslog';
import { TestChannelInjector } from './channel/helpers/injector.js';
import { dropAll } from './infra/db/utils.js';
import { ChannelCommander } from './channel/business/channel.commander.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const env = app.get<Env>(ENV);
  if (env.nodeEnv !== 'prod') {
    log.info('Env', env);
    app.enableCors();

    await dropAll();
    const injector = new TestChannelInjector(app.get(ChannelCommander));
    await injector.insertTestChannels();
  }

  const scheduler = app.get(LiveScheduler);
  scheduler.run();

  await app.listen(env.appPort);
}

bootstrap();
