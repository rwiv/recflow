import {Env} from "./env.js";
import {Streamq} from "../client/Streamq.js";
import {StdlMock, StdlImpl} from "../client/Stdl.js";
import {AuthedImpl, AuthedMock} from "../client/Authed.js";
import {MockNotifier, Notifier, NtfyNotifier} from "../client/Notifier.js";
import {TargetRepositoryMem} from "../repository/TargetRepositoryMem.js";
import {TargetRepository} from "../repository/types.js";

export class DepManager {

  readonly streamq: Streamq;
  readonly stdl: StdlImpl | StdlMock;
  readonly authed: AuthedImpl | AuthedMock;
  readonly notifier: Notifier;
  readonly targetRepository: TargetRepository;

  constructor(private readonly env: Env) {
    this.streamq = this.createStreamqClient();
    this.stdl = this.createStdlClient();
    this.authed = this.createAuthClient();
    this.notifier = this.createNotifier();
    this.targetRepository = this.createTargetRepository();
  }

  private createStreamqClient() {
    return new Streamq(this.env.streamqUrl);
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

  private createTargetRepository() {
    return new TargetRepositoryMem();
  }
}