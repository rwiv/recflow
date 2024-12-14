import {ChzzkLiveInfo} from "../client/types_chzzk.js";
import {ChzzkTargetRepository} from "./types.js";

export class ChzzkTargetRepositoryMem implements ChzzkTargetRepository {

  private readonly map: Map<string, ChzzkLiveInfo> = new Map();

  set(id: string, info: ChzzkLiveInfo) {
    if (this.get(id)) {
      throw Error(`${id} is already exists`);
    }
    this.map.set(id, info);
  }

  get(id: string): ChzzkLiveInfo | undefined {
    return this.map.get(id);
  }

  delete(id: string) {
    this.map.delete(id);
  }

  values(): ChzzkLiveInfo[] {
    return Array.from(this.map.values());
  }
}