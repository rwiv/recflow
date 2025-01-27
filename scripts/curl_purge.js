async function main() {
  const [endpoint] = process.argv.slice(2);
  let method = "DELETE";
  const res = await fetch(`${endpoint}/api/lives/purge`, {method});
  console.log(await res.json());
}

main().catch(console.error);
