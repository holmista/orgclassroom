import fs from "node:fs/promises";
import crypto from "node:crypto";
import FileStorageManager from "./fileStorageManager.js";

class StaticFileManager {
  private readonly imageSupportedTypes = ["png", "jpg", "jpeg", "pdf"];
  private readonly fileStorageManager = FileStorageManager.getInstance();
  private static instance: StaticFileManager;
  private constructor() {}
  static getInstance(): StaticFileManager {
    if (!StaticFileManager.instance) {
      StaticFileManager.instance = new StaticFileManager();
    }
    return StaticFileManager.instance;
  }
  async writeFile(userId: number, subjectId: number, noteId: number, image: Express.Multer.File) {
    let imageType = image.mimetype.split("/")[1];
    if (!this.imageSupportedTypes.includes(imageType)) throw new Error("image type not supported");
    let imageName =
      image.originalname.split(".")[0] + Date.now() + crypto.randomBytes(12).toString("hex") + "." + imageType;
    await this.fileStorageManager.writeFile(userId, subjectId, noteId, imageName, image.buffer);
  }
  async writeFiles(userId: number, subjectId: number, noteId: number, images: Express.Multer.File[]) {
    const promises: Promise<void>[] = [];
    for (const image of images) {
      let writePromise = this.writeFile(userId, subjectId, noteId, image);
      promises.push(writePromise);
    }
    await Promise.all(promises);
  }
  async readFile(userId: number, subjectId: number, noteId: number, filename: string) {
    if (!this.imageSupportedTypes.includes(filename.split(".")[1])) throw new Error("image type not supported");
    return await this.fileStorageManager.readFile(userId, subjectId, noteId, filename);
  }

  async readFiles(userId: number, subjectId: number, noteId: number) {
    try {
      let images = await fs.readdir(`storage/${userId}/${subjectId}/${noteId}`);
      images = images.filter((image) => this.imageSupportedTypes.includes(image.split(".")[1]));
      const promises: Promise<Buffer | undefined>[] = [];
      for (const image of images) {
        let readPromise = this.readFile(userId, subjectId, noteId, image);
        promises.push(readPromise);
      }
      return await Promise.all(promises);
    } catch (error: any) {
      if (error.code === "ENOENT") throw new Error("path not found");
      else throw new Error("something went wrong");
    }
  }

  async deleteFile(userId: number, subjectId: number, noteId: number, filename: string) {
    if (!this.imageSupportedTypes.includes(filename.split(".")[1])) throw new Error("image type not supported");
    await this.fileStorageManager.deleteFile(userId, subjectId, noteId, filename);
  }
  async deleteFiles(userId: number, subjectId: number, noteId: number) {
    try {
      let images = await fs.readdir(`storage/${userId}/${subjectId}/${noteId}`);
      images = images.filter((image) => this.imageSupportedTypes.includes(image.split(".")[1]));
      const promises: Promise<void>[] = [];
      for (const image of images) {
        let deletePromise = this.deleteFile(userId, subjectId, noteId, image);
        promises.push(deletePromise);
      }
      await Promise.all(promises);
    } catch (error: any) {
      if (error.code === "ENOENT") throw new Error("path not found");
      else throw new Error("something went wrong");
    }
  }
}

export default StaticFileManager;
