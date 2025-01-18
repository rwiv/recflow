import {SoopTargetRepository} from "./types.js";
import {SoopLiveInfo} from "../client/types_soop.js";

export class SoopTargetRepositoryMem implements SoopTargetRepository {

  private readonly map: Map<string, SoopLiveInfo> = new Map();

  async set(id: string, info: SoopLiveInfo) {
    if (this.map.get(id)) {
      throw Error(`${id} is already exists`);
    }
    this.map.set(id, info);
  }

  async get(id: string) {
    return this.map.get(id);
  }

  async delete(id: string) {
    this.map.delete(id);
  }

  async all() {
    return Array.from(this.map.values());
  }
}