import fs from "fs/promises";

async function emptyDir() {
  const dirs = await fs.readdir("storage");
  const promises: Promise<void>[] = [];
  for (const dir of dirs) {
    const rmPromise = fs.rmdir("storage/" + dir, { recursive: true });
    promises.push(rmPromise);
  }
  await Promise.all(promises);
}

export default emptyDir;
