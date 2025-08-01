import fs from 'fs';

const platformName = "chzzk";
const filePath = '../dev/test/test_chzzk.txt'

// const platformName = "soop";
// const filePath = '../dev/test/test_soop.txt'

async function main() {
    const [endpoint] = process.argv.slice(2);
    const channelIds = fs.readFileSync(filePath, 'utf-8')
        .split('\n').filter(it => it.length > 0);

    for (const channelId of channelIds) {
        try {
            const res = await fetch(`${endpoint}/api/lives`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    sourceId: channelId,
                    platformName,
                }),
            });
            console.log(channelId);
            if (res.status === 404) {
                console.log(await res.text())
            }
        } catch (e) {
            console.error(e);
        }
    }
}

main();
