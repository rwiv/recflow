import { describe, it, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module.js';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types.js';

describe.skip('AppController', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('health', () => {
    return request(app.getHttpServer()).get('/api/health').expect(200).expect('hello');
  });
});
