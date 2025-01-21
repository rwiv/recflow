async function main() {
  const [endpoint, cmd, type, userId] = process.argv.slice(2);
  if (["add", "del"].includes(cmd) === false) {
    throw new Error("Invalid command");
  }
  let method = "POST";
  if (cmd === "del") {
    method = "DELETE";
  }
  if (["chzzk", "soop"].includes(type) === false) {
    throw new Error("Invalid type");
  }
  console.log(type, userId);
  const res = await fetch(`${endpoint}/api/${type}/${userId}`, {method});
  console.log(await res.json());
}

main().catch(console.error);
