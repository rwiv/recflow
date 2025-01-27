const commands = {
  create: "create",
  delete: "delete",
  cancel: "cancel",
};

const types = {
    chzzk: "chzzk",
    soop: "soop",
}

function isExitCommand(cmd) {
    return cmd === commands.delete || cmd === commands.cancel;
}

async function main() {
  const [endpoint, cmd, type, userId] = process.argv.slice(2);

  // Validate input
  if (Object.values(commands).includes(cmd) === false) {
    throw new Error("Invalid command");
  }
  if (Object.values(types).includes(type) === false) {
    throw new Error("Invalid type");
  }

  // Send request
  let method = "POST";
  let qs = "";
  if (isExitCommand(cmd)) {
    method = "DELETE";
    qs = `?cmd=${cmd}`;
  }
  const res = await fetch(`${endpoint}/api/${type}/${userId}${qs}`, {method});
  console.log(await res.json());
}

main().catch(console.error);
