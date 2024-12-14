import {Env} from "./env.js";
import {Streamq} from "../client/Streamq.js";
import {StdlMock, StdlImpl} from "../client/Stdl.js";
import {AuthedImpl, AuthedMock} from "../client/Authed.js";
import {MockNotifier, Notifier, NtfyNotifier} from "../client/Notifier.js";
import {ChzzkTargetRepositoryMem} from "../repository/ChzzkTargetRepositoryMem.js";
import {ChzzkTargetRepository} from "../repository/types.js";
import {SoopTargetRepositoryMem} from "../repository/SoopTargetRepositoryMem.js";
import {ChzzkChecker} from "../observer/ChzzkChecker.js";
import {QueryConfig} from "./config.js";
import {SoopChecker} from "../observer/SoopChecker.js";

export class DepManager {

  readonly streamq: Streamq;
  readonly stdl: StdlImpl | StdlMock;
  readonly authed: AuthedImpl | AuthedMock;
  readonly notifier: Notifier;
  readonly chzzkTargetRepository: ChzzkTargetRepository;
  readonly soopTargetRepository: SoopTargetRepositoryMem;
  readonly chzzkChecker: ChzzkChecker;
  readonly soopChecker: SoopChecker;

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

    this.chzzkChecker = new ChzzkChecker(
      this.query, this.streamq, this.stdl, this.authed, this.notifier,
      this.chzzkTargetRepository, env.ntfyTopic,
    );
    this.soopChecker = new SoopChecker(
      this.query, this.streamq, this.stdl, this.authed, this.notifier,
      this.soopTargetRepository, env.ntfyTopic,
    );
  }

  private createStreamqClient() {
    return new Streamq(this.env.streamqUrl, this.env.querySize);
  }

  private createStdlClient() {
    if (this.env.nodeEnv === "prod" && this.env.stdlUrl !== undefined) {
      return new StdlImpl(this.env.stdlUrl);
    } else {
      return new StdlMock();
    }
  }

  private createAuthClient() {
    if (this.env.nodeEnv === "prod" && this.env.authUrl !== undefined) {
      return new AuthedImpl(this.env.authUrl);
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
    return new ChzzkTargetRepositoryMem();
  }

  private createSoopTargetRepository() {
    return new SoopTargetRepositoryMem();
  }
}
