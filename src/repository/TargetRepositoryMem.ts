import {LiveInfo} from "../client/types.js";
import {TargetRepository} from "./types.js";

export class TargetRepositoryMem implements TargetRepository {

  private readonly map: Map<string, LiveInfo> = new Map();

  set(id: string, info: LiveInfo) {
    if (this.get(id)) {
      throw Error(`${id} is already exists`);
    }
    this.map.set(id, info);
  }

  get(id: string): LiveInfo | undefined {
    return this.map.get(id);
  }

  delete(id: string) {
    this.map.delete(id);
  }

  values(): LiveInfo[] {
    return Array.from(this.map.values());
  }
}