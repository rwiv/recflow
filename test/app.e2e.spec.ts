import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { afterAll, beforeAll, describe, it } from 'vitest';

import { GlobalModule } from '../src/common/global/global.module.js';
import { newTestApp, newTestingModuleRef } from '../src/common/helpers/helper.app.js';

describe.skip('AppController', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleRef = await newTestingModuleRef([GlobalModule]);
    app = await newTestApp(moduleRef);
  });

  afterAll(async () => {
    await app.close();
  });

  it('health', () => {
    return request(app.getHttpServer()).get('/api/health').expect(200).expect('hello');
  });
});
