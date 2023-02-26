import fs from "fs/promises";

await fs.mkdir("saigo");
await fs.writeFile("saigo/a.txt", "aaaaa");
