import { Env } from './env.js';
import { Streamq } from '../client/streamq.js';
import { StdlMock, StdlImpl, Stdl } from '../client/stdl.js';
import { AuthedImpl, AuthedMock } from '../client/authed.js';
import { MockNotifier, Notifier, NtfyNotifier } from '../client/notifier.js';
import { TargetRepositoryMemChzzk } from '../repository/target-repository.mem.chzzk.js';
import { ChzzkTargetRepository } from '../repository/types.js';
import { TargetRepositoryMemSoop } from '../repository/target-repository.mem.soop.js';
import { CheckerChzzk } from '../observer/checker.chzzk.js';
import { QueryConfig } from './query.js';
import { CheckerSoop } from '../observer/checker.soop.js';
import { AllocatorChzzk } from '../observer/allocator.chzzk.js';
import { ChzzkWebhookMatcher, SoopWebhookMatcher } from '../webhook/types.js';
import { WebhookMatcherChzzkMode1 } from '../webhook/chzzk/webhook-matcher.chzzk.mode1.js';
import { WebhookMatcherChzzkMode4 } from '../webhook/chzzk/webhook-matcher.chzzk.mode4.js';
import { WebhookMatcherChzzkMode3 } from '../webhook/chzzk/webhook-matcher.chzzk.mode3.js';
import { WebhookMatcherChzzkMode2 } from '../webhook/chzzk/webhook-matcher.chzzk.mode2.js';
import { WebhookMatcherSoopMode1 } from '../webhook/soop/webhook-matcher.soop.mode1.js';
import { AllocatorSoop } from '../observer/allocator.soop.js';
import { MainRouter } from '../server/main_router.js';

export class DepManager {
  readonly streamq: Streamq;
  readonly stdl: Stdl;
  readonly authed: AuthedImpl | AuthedMock;
  readonly notifier: Notifier;
  readonly chzzkTargetRepository: ChzzkTargetRepository;
  readonly soopTargetRepository: TargetRepositoryMemSoop;
  readonly chzzkChecker: CheckerChzzk;
  readonly soopChecker: CheckerSoop;
  readonly chzzkAllocator: AllocatorChzzk;
  readonly soopAllocator: AllocatorSoop;
  readonly chzzkWebhookMatcher: ChzzkWebhookMatcher;
  readonly soopWebhookMatcher: SoopWebhookMatcher;

  readonly mainRouter: MainRouter;

  constructor(
    private readonly env: Env,
    private readonly query: QueryConfig,
  ) {
    this.streamq = this.createStreamqClient();
    this.stdl = this.createStdlClient();
    this.authed = this.createAuthClient();
    this.notifier = this.createNotifier();
    this.chzzkTargetRepository = this.createChzzkTargetRepository();
    this.soopTargetRepository = this.createSoopTargetRepository();

    this.chzzkWebhookMatcher = this.createChzzkWebhookMatcher();
    this.soopWebhookMatcher = this.createSoopWebhookMatcher();

    this.chzzkAllocator = new AllocatorChzzk(
      this.stdl,
      this.authed,
      this.notifier,
      env.ntfyTopic,
      this.chzzkTargetRepository,
      this.chzzkWebhookMatcher,
    );
    this.chzzkChecker = new CheckerChzzk(
      this.query,
      this.streamq,
      this.chzzkTargetRepository,
      this.chzzkAllocator,
    );

    this.soopAllocator = new AllocatorSoop(
      this.stdl,
      this.authed,
      this.notifier,
      env.ntfyTopic,
      this.soopTargetRepository,
      this.soopWebhookMatcher,
    );
    this.soopChecker = new CheckerSoop(
      this.query,
      this.streamq,
      this.soopTargetRepository,
      this.soopAllocator,
    );

    this.mainRouter = new MainRouter(
      this.streamq,
      this.chzzkTargetRepository,
      this.soopTargetRepository,
      this.chzzkAllocator,
      this.soopAllocator,
    );
  }

  private createChzzkWebhookMatcher() {
    switch (this.query.webhookMode) {
      case 'mode1':
        return new WebhookMatcherChzzkMode1();
      case 'mode2':
        return new WebhookMatcherChzzkMode2(this.query);
      case 'mode3':
        return new WebhookMatcherChzzkMode3(this.query);
      case 'mode4':
        return new WebhookMatcherChzzkMode4(this.query);
    }
  }

  private createSoopWebhookMatcher() {
    switch (this.query.webhookMode) {
      case 'mode1':
        return new WebhookMatcherSoopMode1();
      default:
        throw Error('Unsupported webhook mode');
    }
  }

  private createStreamqClient() {
    return new Streamq(this.env);
  }

  private createStdlClient() {
    if (this.env.nodeEnv === 'prod' && this.env.stdlUrl !== undefined) {
      return new StdlImpl();
    } else {
      return new StdlMock();
    }
  }

  private createAuthClient() {
    if (this.env.nodeEnv === 'prod' && this.env.authedUrl !== undefined) {
      return new AuthedImpl(this.env.authedUrl, this.env.authedEncKey);
    } else {
      return new AuthedMock();
    }
  }

  private createNotifier(): Notifier {
    if (this.env.nodeEnv === 'prod' && this.env.ntfyEndpoint !== undefined) {
      return new NtfyNotifier(this.env.ntfyEndpoint);
    } else {
      return new MockNotifier();
    }
  }

  private createChzzkTargetRepository() {
    return new TargetRepositoryMemChzzk(this.query);
  }

  private createSoopTargetRepository() {
    return new TargetRepositoryMemSoop(this.query);
  }
}
