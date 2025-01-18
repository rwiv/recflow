import {log} from "jslog";
import {startServer} from "./server/server.js";

startServer().catch(err => log.error(err));
