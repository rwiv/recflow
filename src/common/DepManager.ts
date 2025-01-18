import {Env} from "./env.js";
import {Streamq} from "../client/Streamq.js";
import {StdlMock, StdlImpl, Stdl} from "../client/Stdl.js";
import {AuthedImpl, AuthedMock} from "../client/Authed.js";
import {MockNotifier, Notifier, NtfyNotifier} from "../client/Notifier.js";
import {ChzzkTargetRepositoryMem} from "../repository/ChzzkTargetRepositoryMem.js";
import {ChzzkTargetRepository} from "../repository/types.js";
import {SoopTargetRepositoryMem} from "../repository/SoopTargetRepositoryMem.js";
import {ChzzkChecker} from "../observer/ChzzkChecker.js";
import {QueryConfig} from "./query.js";
import {SoopChecker} from "../observer/SoopChecker.js";
import {ChzzkAllocator} from "../observer/ChzzkAllocator.js";
import {ChzzkWebhookMatcher, SoopWebhookMatcher} from "../webhook/types.js";
import {ChzzkWebhookMatcherMode1} from "../webhook/chzzk/ChzzkWebhookMatcherMode1.js";
import {ChzzkWebhookMatcherMode4} from "../webhook/chzzk/ChzzkWebhookMatcherMode4.js";
import {ChzzkWebhookMatcherMode3} from "../webhook/chzzk/ChzzkWebhookMatcherMode3.js";
import {ChzzkWebhookMatcherMode2} from "../webhook/chzzk/ChzzkWebhookMatcherMode2.js";
import {SoopWebhookMatcherMode1} from "../webhook/soop/SoopWebhookMatcherMode1.js";
import {SoopAllocator} from "../observer/SoopAllocator.js";

export class DepManager {

  readonly streamq: Streamq;
  readonly stdl: Stdl;
  readonly authed: AuthedImpl | AuthedMock;
  readonly notifier: Notifier;
  readonly chzzkTargetRepository: ChzzkTargetRepository;
  readonly soopTargetRepository: SoopTargetRepositoryMem;
  readonly chzzkChecker: ChzzkChecker;
  readonly soopChecker: SoopChecker;
  readonly chzzkAllocator: ChzzkAllocator;
  readonly soopAllocator: SoopAllocator;
  readonly chzzkWebhookMatcher: ChzzkWebhookMatcher;
  readonly soopWebhookMatcher: SoopWebhookMatcher;

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

    this.chzzkAllocator = new ChzzkAllocator(
      this.stdl, this.authed, this.notifier, env.ntfyTopic,
      this.chzzkTargetRepository, this.chzzkWebhookMatcher,
    );
    this.chzzkChecker = new ChzzkChecker(
      this.query, this.streamq, this.chzzkTargetRepository, this.chzzkAllocator,
    );

    this.soopAllocator = new SoopAllocator(
      this.stdl, this.authed, this.notifier, env.ntfyTopic,
      this.soopTargetRepository, this.soopWebhookMatcher,
    );
    this.soopChecker = new SoopChecker(
      this.query, this.streamq, this.soopTargetRepository, this.soopAllocator,
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

  private createSoopWebhookMatcher() {
    switch (this.query.webhookMode) {
      case "mode1":
        return new SoopWebhookMatcherMode1();
      default:
        throw Error("Unsupported webhook mode");
    }
  }

  private createStreamqClient() {
    return new Streamq(this.env.streamqUrl, this.env.streamqQsize);
  }

  private createStdlClient() {
    if (this.env.nodeEnv === "prod" && this.env.stdlUrl !== undefined) {
      return new StdlImpl();
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
    return new SoopTargetRepositoryMem(this.query);
  }
}
