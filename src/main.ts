import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { LiveScheduler } from './live/scheduler/scheduler.js';
import { ENV } from './common/config.module.js';
import { Env } from './common/env.js';
import { TestChannelInjector } from './channel/helpers/injector.js';
import { dropAll } from './infra/db/utils.js';
import { ChannelWriter } from './channel/business/channel.writer.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const env = app.get<Env>(ENV);
  if (env.nodeEnv !== 'prod') {
    app.enableCors();

    await dropAll();
    const injector = new TestChannelInjector(app.get(ChannelWriter));
    await injector.insertTestChannels();
  }

  const scheduler = app.get(LiveScheduler);
  scheduler.run();

  await app.listen(env.appPort);
}

bootstrap();
