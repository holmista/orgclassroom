import fs from "node:fs/promises";

class FileStorageManager {
  private static baseFolder = "storage";
  private static instance: FileStorageManager;
  private constructor() {}
  static getInstance(): FileStorageManager {
    if (!FileStorageManager.instance) {
      FileStorageManager.instance = new FileStorageManager();
    }
    return FileStorageManager.instance;
  }
  private handleErrors(error: any) {
    if (error.code === "ENOENT") throw new Error("path not found");
    if (error.code == "EEXIST") throw new Error("folder already exists");
    else throw new Error("something went wrong");
  }
  async writeFile(
    userId: number,
    subjectId: number,
    noteId: number,
    filename: string,
    content: Buffer
  ) {
    try {
      await fs.writeFile(
        `${FileStorageManager.baseFolder}/${userId}/${subjectId}/${noteId}/${filename}`,
        content
      );
    } catch (error: any) {
      this.handleErrors(error);
    }
  }
  async readFile(
    userId: number,
    subjectId: number,
    noteId: number,
    filename: string
  ) {
    try {
      const result = await fs.readFile(
        `${FileStorageManager.baseFolder}/${userId}/${subjectId}/${noteId}/${filename}`
      );
      return result;
    } catch (error: any) {
      this.handleErrors(error);
    }
  }
  async readFiles(userId: number, subjectId: number, noteId: number) {
    try {
      const files = await fs.readdir(
        `storage/${userId}/${subjectId}/${noteId}`
      );
      const promises: Promise<Buffer | undefined>[] = [];
      for (const file of files) {
        let readPromise = this.readFile(userId, subjectId, noteId, file);
        promises.push(readPromise);
      }
      return await Promise.all(promises);
    } catch (error: any) {
      this.handleErrors(error);
    }
  }

  async getNoteFilesLinks(userId: number, subjectId: number, noteId: number) {
    try {
      const files = await fs.readdir(
        `storage/${userId}/${subjectId}/${noteId}`
      );
      return files.map(
        (file) =>
          `${process.env.BASE_URL}/file/${userId}/${subjectId}/${noteId}/${file}`
      );
    } catch (error: any) {
      this.handleErrors(error);
    }
  }

  async deleteFile(
    userId: number,
    subjectId: number,
    noteId: number,
    filename: string
  ) {
    try {
      await fs.unlink(`storage/${userId}/${subjectId}/${noteId}/${filename}`);
    } catch (error: any) {
      this.handleErrors(error);
    }
  }
  private async createFolder(path: string) {
    try {
      await fs.mkdir(path);
    } catch (error: any) {
      this.handleErrors(error);
    }
  }
  private async deleteFolder(path: string) {
    try {
      await fs.rm(path, { recursive: true });
    } catch (error: any) {
      this.handleErrors(error);
    }
  }
  async createUserFolder(userId: number) {
    await this.createFolder(`${FileStorageManager.baseFolder}/${userId}`);
  }
  async createSubjectFolder(userId: number, subjectId: number) {
    await this.createFolder(
      `${FileStorageManager.baseFolder}/${userId}/${subjectId}`
    );
  }
  async deleteUserFolder(userId: number) {
    await this.deleteFolder(`${FileStorageManager.baseFolder}/${userId}`);
  }
  async deleteSubjectFolder(userId: number, subjectId: number) {
    await this.deleteFolder(
      `${FileStorageManager.baseFolder}/${userId}/${subjectId}`
    );
  }
  async createNoteFolder(userId: number, subjectId: number, noteId: number) {
    await this.createFolder(
      `${FileStorageManager.baseFolder}/${userId}/${subjectId}/${noteId}`
    );
  }
  async deleteNoteFolder(userId: number, subjectId: number, noteId: number) {
    await this.deleteFolder(
      `${FileStorageManager.baseFolder}/${userId}/${subjectId}/${noteId}`
    );
  }
}

export default FileStorageManager;
