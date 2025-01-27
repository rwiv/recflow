import { LiveEventListener } from './listener.js';
import { Env } from '../../common/env.js';
import { QueryConfig } from '../../common/query.js';
import { StdlMock } from '../../infra/stdl/stdl.mock.js';
import { AuthedMock } from '../../infra/authed/authed.mock.js';
import { MockNotifier } from '../../infra/notify/notifier.mock.js';
import { Dispatcher } from './dispatcher.js';
import { AmqpMock } from '../../infra/amqp/amqp.mock.js';

export function createLiveEventListener(env: Env, query: QueryConfig) {
  const stdl = new StdlMock();
  const authed = new AuthedMock();
  const notifier = new MockNotifier();
  const amqp = new AmqpMock();
  const dispatcher = new Dispatcher(amqp);
  return new LiveEventListener(env, query, stdl, authed, notifier, dispatcher);
}
