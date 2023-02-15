import fs from "node:fs/promises";
import crypto from "node:crypto";
import FileStorageManager from "./fileStorageManager.js";

class ImageManager {
  static readonly imageSupportedTypes = ["png", "jpg", "jpeg"];
  static readonly fileStorageManager = FileStorageManager.getInstance();
  static async writeImage(
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
  static async writeImages(
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
  static async readImage(userId: number, subjectId: number, filename: string) {
    return await this.fileStorageManager.readFile(userId, subjectId, filename);
  }

  static async readImages(userId: number, subjectId: number) {
    const images = await fs.readdir(`storage/${userId}/${subjectId}`);
    const promises: Promise<Buffer | undefined>[] = [];
    for (const image of images) {
      let readPromise = this.readImage(userId, subjectId, image);
      promises.push(readPromise);
    }
    return await Promise.all(promises);
  }

  static async deleteImage(
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
// const imageBuffer = await fs.readFile("lib/1.png");
// const f = new Filee();
// f.writeImage(1, 2, "test.png", imageBuffer);

// ImageManager.deleteSubjectFolder(3, 3);

async function wait(ms: number) {
  const start = Date.now();
  return await new Promise((resolve) =>
    setTimeout(
      (resolve) => console.log(`resolved in ${Date.now() - start}ms`),
      ms
    )
  );
}

async function loop() {
  const promises = [];
  for (let i = 0; i < 50; i++) {
    promises.push(wait(2000));
    await wait(2000);
  }
  await Promise.all(promises);
}

loop();

export default ImageManager;
