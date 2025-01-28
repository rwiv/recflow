async function main() {
  const [endpoint] = process.argv.slice(2);
  let method = "POST";
  const res = await fetch(`${endpoint}/api/webhooks/sync`, {method});
  console.log(await res.text());
}

main().catch(console.error);
