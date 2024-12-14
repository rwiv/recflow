import {Env} from "./env.js";
import {StreamqClient} from "../client/StreamqClient.js";
import {MockStdlClient, StdlClientImpl} from "../client/StdlClient.js";
import {AuthClientImpl, MockAuthClient} from "../client/AuthClient.js";
import {MockNotifier, Notifier, NtfyNotifier} from "../client/Notifier.js";
import {TargetRepositoryMem} from "../repository/TargetRepositoryMem.js";
import {TargetRepository} from "../repository/types.js";

export class DepManager {

  readonly streamq: StreamqClient;
  readonly stdl: StdlClientImpl | MockStdlClient;
  readonly auth: AuthClientImpl | MockAuthClient;
  readonly notifier: Notifier;
  readonly targetRepository: TargetRepository;

  constructor(private readonly env: Env) {
    this.streamq = this.createStreamqClient();
    this.stdl = this.createStdlClient();
    this.auth = this.createAuthClient();
    this.notifier = this.createNotifier();
    this.targetRepository = this.createTargetRepository();
  }

  private createStreamqClient() {
    return new StreamqClient(this.env.streamqUrl);
  }

  private createStdlClient() {
    if (this.env.nodeEnv === "prod" && this.env.stdlUrl !== undefined) {
      return new StdlClientImpl(this.env.stdlUrl);
    } else {
      return new MockStdlClient();
    }
  }

  private createAuthClient() {
    if (this.env.nodeEnv === "prod" && this.env.authUrl !== undefined) {
      return new AuthClientImpl(this.env.authUrl);
    } else {
      return new MockAuthClient();
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