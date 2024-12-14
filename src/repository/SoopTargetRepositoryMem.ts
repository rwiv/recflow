import {SoopTargetRepository} from "./types.js";
import {SoopLiveInfo} from "../client/types_soop.js";

export class SoopTargetRepositoryMem implements SoopTargetRepository {

  private readonly map: Map<string, SoopLiveInfo> = new Map();

  set(id: string, info: SoopLiveInfo) {
    if (this.get(id)) {
      throw Error(`${id} is already exists`);
    }
    this.map.set(id, info);
  }

  get(id: string): SoopLiveInfo | undefined {
    return this.map.get(id);
  }

  delete(id: string) {
    this.map.delete(id);
  }

  values(): SoopLiveInfo[] {
    return Array.from(this.map.values());
  }
}