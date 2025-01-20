import fs from 'fs/promises';
import {it} from "vitest";

it("test", async () => {
  const channelIds = (await fs.readFile('./dev/test_chzzk.txt', 'utf-8')).split('\n');
  for (const url of channelIds) {
    const res = await req(url);
  }
  console.log("complete");
});

async function req(channelId: string) {
  const res = await fetch(`http://localhost:3000/api/chzzk/${channelId}`, {
    method: 'POST',
  });
  return res.json();
}
