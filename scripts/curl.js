async function main() {
  const [type, userId] = process.argv.slice(2);
  if (["chzzk", "soop"].includes(type) === false) {
    throw new Error("Invalid type");
  }
  console.log(type, userId);
  const res = await fetch(`http://localhost:3000/api/${type}/${userId}`, {
    "method": "POST",
  });
  console.log(await res.json());
}

main().catch(console.error);
