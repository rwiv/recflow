import fs from 'fs';

const commands = {
    create: "create",
    delete: "delete",
    cancel: "cancel",
};

function isExitCommand(cmd) {
    return cmd === commands.delete || cmd === commands.cancel;
}

async function main() {
    const [endpoint, cmd] = process.argv.slice(2);
    const channelIds = fs.readFileSync('../dev/test_chzzk.txt', 'utf-8')
        .split('\n').filter(it => it.length > 0);

    if (Object.values(commands).includes(cmd) === false) {
        throw new Error("Invalid command");
    }

    let method = "POST";
    let qs = "";
    if (isExitCommand(cmd)) {
        method = "DELETE";
        qs = `?cmd=${cmd}`;
    }
    for (const channelId of channelIds) {
        await fetch(`${endpoint}/api/chzzk/${channelId}${qs}`, {method});
        console.log(channelId);
    }
}

main();
