import fs from "fs/promises";

try {
  await fs.mkdir("storage/1");
  //   await fs.writeFile("storage/1/1/test.txt", Buffer.from("test"));
  await fs.mkdir("storage/1");
} catch (e: any) {
  console.log(e.code);
}
