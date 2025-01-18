import {Env} from "./env.js";
import {Streamq} from "../client/Streamq.js";
import {StdlMock, StdlImpl} from "../client/Stdl.js";
import {AuthedImpl, AuthedMock} from "../client/Authed.js";
import {MockNotifier, Notifier, NtfyNotifier} from "../client/Notifier.js";
import {ChzzkTargetRepositoryMem} from "../repository/ChzzkTargetRepositoryMem.js";
import {ChzzkTargetRepository} from "../repository/types.js";
import {SoopTargetRepositoryMem} from "../repository/SoopTargetRepositoryMem.js";
import {ChzzkChecker} from "../observer/ChzzkChecker.js";
import {QueryConfig} from "./query.js";
import {SoopChecker} from "../observer/SoopChecker.js";
import {ChzzkAllocator} from "../observer/ChzzkAllocator.js";
import {ChzzkWebhookMatcher} from "../webhook/types.js";
import {ChzzkWebhookMatcherMode1} from "../webhook/chzzk/ChzzkWebhookMatcherMode1.js";
import {ChzzkWebhookMatcherMode4} from "../webhook/chzzk/ChzzkWebhookMatcherMode4.js";
import {ChzzkWebhookMatcherMode3} from "../webhook/chzzk/ChzzkWebhookMatcherMode3.js";
import {ChzzkWebhookMatcherMode2} from "../webhook/chzzk/ChzzkWebhookMatcherMode2.js";

export class DepManager {

  readonly streamq: Streamq;
  readonly stdl: StdlImpl | StdlMock;
  readonly authed: AuthedImpl | AuthedMock;
  readonly notifier: Notifier;
  readonly chzzkTargetRepository: ChzzkTargetRepository;
  readonly soopTargetRepository: SoopTargetRepositoryMem;
  readonly chzzkChecker: ChzzkChecker;
  readonly soopChecker: SoopChecker;
  readonly chzzkAllocator: ChzzkAllocator;
  readonly chzzkWebhookMatcher: ChzzkWebhookMatcher;

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
    this.chzzkAllocator = new ChzzkAllocator(
      this.stdl, this.authed, this.notifier, env.ntfyTopic,
      this.chzzkTargetRepository, this.chzzkWebhookMatcher,
    );
    this.chzzkChecker = new ChzzkChecker(
      this.query, this.streamq, this.chzzkTargetRepository, this.chzzkAllocator,
    );
    this.soopChecker = new SoopChecker(
      this.query, this.streamq, this.stdl, this.authed, this.notifier,
      this.soopTargetRepository, env.ntfyTopic,
    );
  }

  private createChzzkWebhookMatcher() {
    switch (this.query.webhookMode) {
      case "mode1":
        return new ChzzkWebhookMatcherMode1();
      case "mode2":
        return new ChzzkWebhookMatcherMode2(this.query);
      case "mode3":
        return new ChzzkWebhookMatcherMode3(this.query);
      case "mode4":
        return new ChzzkWebhookMatcherMode4(this.query);
    }
  }

  private createStreamqClient() {
    return new Streamq(this.env.streamqUrl, this.env.streamqQsize);
  }

  private createStdlClient() {
    if (this.env.nodeEnv === "prod" && this.env.stdlUrl !== undefined) {
      return new StdlImpl(this.env.stdlUrl);
    } else {
      return new StdlMock();
    }
  }

  private createAuthClient() {
    if (this.env.nodeEnv === "prod" && this.env.authedUrl !== undefined) {
      return new AuthedImpl(this.env.authedUrl, this.env.authedEncKey);
    } else {
      return new AuthedMock();
    }
  }

  private createNotifier(): Notifier {
    if (this.env.nodeEnv === "prod" && this.env.ntfyEndpoint !== undefined) {
      return new NtfyNotifier(this.env.ntfyEndpoint);
    } else {
      return new MockNotifier();
    }
  }

  private createChzzkTargetRepository() {
    return new ChzzkTargetRepositoryMem(this.query);
  }

  private createSoopTargetRepository() {
    return new SoopTargetRepositoryMem();
  }
}
