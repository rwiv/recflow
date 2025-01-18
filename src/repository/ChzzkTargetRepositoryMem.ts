import {ChzzkLiveInfo} from "../client/types_chzzk.js";
import {ChzzkLiveState, ChzzkTargetRepository} from "./types.js";
import {QueryConfig} from "../common/query.js";
import {ChzzkWebhookState} from "../webhook/types.js";

export class ChzzkTargetRepositoryMem implements ChzzkTargetRepository {

  private readonly map: Map<string, ChzzkLiveState> = new Map();
  private readonly whMap: Map<string, number> = new Map();

  constructor(private readonly query: QueryConfig) {
    const names = query.webhooks.map(wh => wh.name)
    for (const name of names) {
      this.whMap.set(name, 0);
    }
  }

  async whStates() {
    return this.query.webhooks.map(wh => {
      const whCnt = this.whMap.get(wh.name);
      if (whCnt === undefined) {
        throw Error("whCnt is undefined");
      }
      return { ...wh, chzzkAssignedCnt: whCnt };
    });
  }

  async set(id: string, info: ChzzkLiveInfo, wh: ChzzkWebhookState) {
    if (this.map.get(id)) {
      throw Error(`${id} is already exists`);
    }
    const curCnt = this.whMap.get(wh.name);
    if (curCnt === undefined) {
      throw Error("curCnt is undefined");
    }
    this.whMap.set(wh.name, curCnt + 1);
    this.map.set(id, { ...info, assignedWebhookName: wh.name });
  }

  async get(id: string) {
    return this.map.get(id);
  }

  async delete(id: string) {
    const state = this.map.get(id);
    if (!state) {
      throw Error(`${id} is not found`);
    }
    const curCnt = this.whMap.get(state.assignedWebhookName);
    if (curCnt === undefined) {
      throw Error("curCnt is undefined");
    }
    this.whMap.set(state.assignedWebhookName, curCnt - 1);
    this.map.delete(id);
  }

  async all() {
    return Array.from(this.map.values());
  }
}
