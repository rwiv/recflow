import { Inject, Injectable } from '@nestjs/common';
import { TASK_REDIS } from '../../infra/infra.tokens.js';
import { Redis } from 'ioredis';
import { v4 } from 'uuid';
import { cronTaskDefs } from '../spec/task.queue-defs.js';
import { log } from 'jslog';

@Injectable()
export class TaskLockManager {
  constructor(@Inject(TASK_REDIS) private readonly redis: Redis) {}

  async get(name: string) {
    return this.redis.get(this.getKey(name));
  }

  async acquire(name: string, ex: number) {
    const token = v4();
    const ok = await this.redis.set(this.getKey(name), token, 'EX', ex, 'NX');
    if (ok === null) {
      return null;
    } else {
      return token;
    }
  }

  async release(name: string, token: string): Promise<boolean | null> {
    const key = this.getKey(name);
    const lock = await this.redis.get(key);
    if (lock === null) {
      return null;
    }
    if (lock !== token) {
      return false;
    }
    await this.redis.del(key);
    return true;
  }

  async releaseAll() {
    for (const taskName in cronTaskDefs) {
      const deleted = await this.redis.del(this.getKey(taskName));
      if (deleted > 0) {
        log.debug(`Release Lock: ${taskName}`);
      }
    }
  }

  private getKey(taskName: string) {
    return `task:${taskName}:lock`;
  }
}
