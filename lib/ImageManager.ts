import fs from "node:fs/promises";
import crypto from "node:crypto";
import FileStorageManager from "./fileStorageManager.js";

class ImageManager {
  private readonly imageSupportedTypes = ["png", "jpg", "jpeg"];
  private readonly fileStorageManager = FileStorageManager.getInstance();
  private static instance: ImageManager;
  private constructor() {}
  static getInstance(): ImageManager {
    if (!ImageManager.instance) {
      ImageManager.instance = new ImageManager();
    }
    return ImageManager.instance;
  }
  async writeImage(
    userId: number,
    subjectId: number,
    image: Express.Multer.File
  ) {
    let imageType = image.mimetype.split("/")[1];
    if (!this.imageSupportedTypes.includes(imageType))
      throw new Error("image type not supported");
    let imageName =
      image.originalname.split(".")[0] +
      Date.now() +
      crypto.randomBytes(12).toString("hex") +
      "." +
      imageType;
    await this.fileStorageManager.writeFile(
      userId,
      subjectId,
      imageName,
      image.buffer
    );
  }
  async writeImages(
    userId: number,
    subjectId: number,
    images: Express.Multer.File[],
    fileStorageManager: FileStorageManager = FileStorageManager.getInstance()
  ) {
    const promises: Promise<void>[] = [];
    for (const image of images) {
      let writePromise = this.writeImage(userId, subjectId, image);
      promises.push(writePromise);
    }
    await Promise.all(promises);
  }
  async readImage(userId: number, subjectId: number, filename: string) {
    return await this.fileStorageManager.readFile(userId, subjectId, filename);
  }

  async readImages(userId: number, subjectId: number) {
    const images = await fs.readdir(`storage/${userId}/${subjectId}`);
    const promises: Promise<Buffer | undefined>[] = [];
    for (const image of images) {
      let readPromise = this.readImage(userId, subjectId, image);
      promises.push(readPromise);
    }
    return await Promise.all(promises);
  }

  async deleteImage(
    userId: number,
    subjectId: number,
    noteId: number,
    filename: string
  ) {
    await this.fileStorageManager.deleteFile(
      userId,
      subjectId,
      noteId,
      filename
    );
  }
}

export default ImageManager;
