import { describe, it, beforeAll, afterAll } from 'vitest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { newTestApp } from '../src/common/helpers/helper.app.js';
import { GlobalModule } from '../src/common/global/global.module.js';

describe.skip('AppController', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [GlobalModule],
    }).compile();

    app = await newTestApp(moduleFixture);
  });

  afterAll(async () => {
    await app.close();
  });

  it('health', () => {
    return request(app.getHttpServer()).get('/api/health').expect(200).expect('hello');
  });
});
