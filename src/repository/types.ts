import {LiveInfo} from "../client/types.js";

export interface TargetRepository {
  set(id: string, info: LiveInfo): void;
  get(id: string): LiveInfo | undefined;
  delete(id: string): void;
  values(): LiveInfo[];
}
