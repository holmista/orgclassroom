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
    else throw new Error("something went wrong");
  }
  async writeFile(
    userId: number,
    subjectId: number,
    filename: string,
    content: Buffer
  ) {
    try {
      await fs.writeFile(
        `${FileStorageManager.baseFolder}/${userId}/${subjectId}/${filename}`,
        content
      );
    } catch (error: any) {
      this.handleErrors(error);
    }
  }
  async readFile(userId: number, subjectId: number, filename: string) {
    try {
      const result = await fs.readFile(
        `${FileStorageManager.baseFolder}/${userId}/${subjectId}/${filename}`
      );
      return result;
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
      await fs.rmdir(path, { recursive: true });
    } catch (error: any) {
      this.handleErrors(error);
    }
  }
  private async createUserFolder(userId: number) {
    try {
      await this.createFolder(`${FileStorageManager.baseFolder}/${userId}`);
    } catch (error: any) {
      this.handleErrors(error);
    }
  }
  private async createSubjectFolder(userId: number, subjectId: number) {
    try {
      await this.createFolder(
        `${FileStorageManager.baseFolder}/${userId}/${subjectId}`
      );
    } catch (error: any) {
      this.handleErrors(error);
    }
  }
  private async deleteUserFolder(userId: number) {
    try {
      await this.deleteFolder(`${FileStorageManager.baseFolder}/${userId}`);
    } catch (error: any) {
      this.handleErrors(error);
    }
  }
  private async deleteSubjectFolder(userId: number, subjectId: number) {
    try {
      await this.deleteFolder(
        `${FileStorageManager.baseFolder}/${userId}/${subjectId}`
      );
    } catch (error: any) {
      this.handleErrors(error);
    }
  }
}

export default FileStorageManager;
