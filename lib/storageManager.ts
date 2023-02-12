import fs from "node:fs/promises";

class StorageManager {
  static async writeImage(
    userId: number,
    subjectId: number,
    filename: string,
    content: Buffer
  ) {
    try {
      await fs.writeFile(`storage/${userId}/${subjectId}/${filename}`, content);
    } catch (error: any) {
      if (error.code === "ENOENT") {
        throw new Error("path not found");
      }
    }
  }
  static async readImage(userId: number, subjectId: number, filename: string) {
    try {
      await fs.readFile(`storage/${userId}/${subjectId}/${filename}`);
    } catch (error: any) {
      if (error.code === "ENOENT") {
        throw new Error("path not found");
      }
    }
  }
  static async createUserFolder(userId: number) {
    const userFolders = await fs.readdir("storage");
    if (!userFolders.includes(userId.toString())) {
      await fs.mkdir(`storage/${userId}`);
    }
  }
  static async createSubjectFolder(userId: number, subjectId: number) {
    try {
      const subjectFolders = await fs.readdir(`storage/${userId}`);
      if (!subjectFolders.includes(subjectId.toString())) {
        await fs.mkdir(`storage/${userId}/${subjectId}`);
      }
    } catch (error: any) {
      if (error.code === "ENOENT") {
        throw new Error("user folder not found");
      }
    }
  }
}
// const imageBuffer = await fs.readFile("lib/1.png");
// const f = new Filee();
// f.writeImage(1, 2, "test.png", imageBuffer);

// StorageManager.createSubjectFolder(3, 3);

export default StorageManager;
