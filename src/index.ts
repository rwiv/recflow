import {run} from "./runner.js"
import {log} from "jslog";

run().catch(err => log.error(err));
