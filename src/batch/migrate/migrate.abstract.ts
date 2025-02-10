import fs from 'fs';
import readline from 'node:readline';
import { log } from 'jslog';

export abstract class BatchMigrator {
  abstract migrateOne(line: string): Promise<void>;
  abstract backupRun(endpoint: string, writeLine: (line: string) => Promise<void>): Promise<void>;

  async migrate(filePath: string) {
    const stream = fs.createReadStream(filePath);
    const rl = readline.createInterface({ input: stream });
    let cnt = 0;
    for await (const line of rl) {
      await this.migrateOne(line);
      if (cnt % 100 === 0) {
        log.info(`Migrated ${cnt} channels`);
      }
      cnt++;
    }
    log.info(`Migrated ${cnt} channels`);
  }

  async backup(endpoint: string, filePath: string) {
    await fs.promises.unlink(filePath);
    const ws = fs.createWriteStream(filePath, { flags: 'a' });
    await this.backupRun(endpoint, (line) => this.writeLine(line, ws));
    ws.end();
  }

  private writeLine(line: string, ws: fs.WriteStream): Promise<void> {
    return new Promise((resolve) => {
      const canWrite = ws.write(line + '\n');
      if (!canWrite) {
        ws.once('drain', resolve); // 버퍼가 꽉 차면 drain 이벤트 발생 시 resolve()
      } else {
        resolve(); // 버퍼에 여유가 있으면 바로 resolve()
      }
    });
  }
}
