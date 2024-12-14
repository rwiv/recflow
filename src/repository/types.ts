import {ChzzkLiveInfo} from "../client/types_chzzk.js";
import {SoopLiveInfo} from "../client/types_soop.js";

export interface ChzzkTargetRepository {
  set(id: string, info: ChzzkLiveInfo): void;
  get(id: string): ChzzkLiveInfo | undefined;
  delete(id: string): void;
  values(): ChzzkLiveInfo[];
}

export interface SoopTargetRepository {
  set(id: string, info: SoopLiveInfo): void;
  get(id: string): SoopLiveInfo | undefined;
  delete(id: string): void;
  values(): SoopLiveInfo[];
}
