import fs from "node:fs/promises";
import crypto from "node:crypto";

class ImageManager {
  private readonly imageSupportedTypes = ["png", "jpg", "jpeg"];
  private static async writeImage(
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
  static async writeImages(
    userId: number,
    subjectId: number,
    images: Express.Multer.File[]
  ) {
    try {
      const promises = [];
      for (const image of images) {
        let imageType = image.mimetype.split("/")[1];
        let imageName =
          image.originalname.split(".")[0] +
          Date.now() +
          crypto.randomBytes(12).toString("hex") +
          "." +
          imageType;
        let writePromise = ImageManager.writeImage(
          userId,
          subjectId,
          imageName,
          image.buffer
        );
        promises.push(writePromise);
      }
      await Promise.all(promises);
    } catch (error: any) {
      if (error.code === "ENOENT") {
        throw new Error("path not found");
      }
      throw new Error("something went wrong");
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
  static async deleteSubjectFolder(userId: number, subjectId: number) {
    try {
      await fs.rmdir(`storage/${userId}/${subjectId}`, { recursive: true });
    } catch (error: any) {
      if (error.code === "ENOENT") {
        throw new Error("path not found");
      }
    }
  }
  private static async deleteImage(
    userId: number,
    subjectId: number,
    filename: string
  ) {
    try {
      await fs.unlink(`storage/${userId}/${subjectId}/${filename}`);
    } catch (error: any) {
      if (error.code === "ENOENT") {
        throw new Error("path not found");
      } else {
        throw new Error("something went wrong");
      }
    }
  }
  static async deleteNoteImages(
    userId: number,
    subjectId: number,
    noteId: number
  ) {
    try {
      await fs.rmdir(`storage/${userId}/${subjectId}/${noteId}`, {
        recursive: true,
      });
    } catch (err: any) {
      if (err.code === "ENOENT") {
        throw new Error("path not found");
      } else {
        throw new Error("something went wrong");
      }
    }
  }
}
// const imageBuffer = await fs.readFile("lib/1.png");
// const f = new Filee();
// f.writeImage(1, 2, "test.png", imageBuffer);

// ImageManager.deleteSubjectFolder(3, 3);

export default ImageManager;
