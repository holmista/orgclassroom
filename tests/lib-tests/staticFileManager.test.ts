import StaticFileManager from "../../lib/StaticFileManager.js";
import { test, expect, beforeEach, afterAll } from "@jest/globals";
import fs from "fs/promises";
import emptyDir from "../../src/helpers/emptyDir.js";

const staticFileManager = StaticFileManager.getInstance();

test("return error when writing image with unsupported type", async () => {
  const image = {
    mimetype: "image/gif",
    originalname: "test.gif",
    buffer: await fs.readFile("tests/test-images/test.png")
  } as Express.Multer.File;
  await expect(staticFileManager.writeFile(1, 1, 1, image)).rejects.toThrowError("image type not supported");
});

test("return error when writing image in directory which does not exist", async () => {
  const image = {
    mimetype: "image/png",
    originalname: "test.png",
    buffer: await fs.readFile("tests/test-images/test.png")
  } as Express.Multer.File;
  await expect(staticFileManager.writeFile(1, 1, 1, image)).rejects.toThrowError("path not found");
});

test("write image in directory which exists", async () => {
  const image = {
    mimetype: "image/png",
    originalname: "test.png",
    buffer: await fs.readFile("tests/test-images/test.png")
  } as Express.Multer.File;
  await fs.mkdir("storage/1/1/1", { recursive: true });
  await expect(staticFileManager.writeFile(1, 1, 1, image)).resolves.toBeUndefined();
  const files = await fs.readdir("storage/1/1/1");
  expect(files).toHaveLength(1);
});

test("return error when writing images and one of them has unsupported type", async () => {
  const images = [
    {
      mimetype: "image/png",
      originalname: "test.png",
      buffer: await fs.readFile("tests/test-images/test.png")
    },
    {
      mimetype: "image/gif",
      originalname: "test.gif",
      buffer: await fs.readFile("tests/test-images/test.png")
    }
  ] as Express.Multer.File[];
  await expect(staticFileManager.writeFiles(1, 1, 1, images)).rejects.toThrowError("image type not supported");
});

test("return error when writing images and directory does not exist", async () => {
  const images = [
    {
      mimetype: "image/png",
      originalname: "test.png",
      buffer: await fs.readFile("tests/test-images/test.png")
    },
    {
      mimetype: "image/png",
      originalname: "test.png",
      buffer: await fs.readFile("tests/test-images/test.png")
    }
  ] as Express.Multer.File[];
  await expect(staticFileManager.writeFiles(1, 1, 1, images)).rejects.toThrowError("path not found");
});

test("write images in directory which exists", async () => {
  const images = [
    {
      mimetype: "image/png",
      originalname: "test.png",
      buffer: await fs.readFile("tests/test-images/test.png")
    },
    {
      mimetype: "image/png",
      originalname: "test.png",
      buffer: await fs.readFile("tests/test-images/test.png")
    }
  ] as Express.Multer.File[];
  await fs.mkdir("storage/1/1/1", { recursive: true });
  await expect(staticFileManager.writeFiles(1, 1, 1, images)).resolves.toBeUndefined();
  const files = await fs.readdir("storage/1/1/1");
  expect(files).toHaveLength(2);
});

test("return error when reading image which does not exist", async () => {
  await expect(staticFileManager.readFile(1, 1, 1, "test.png")).rejects.toThrowError("path not found");
});

test("read image which exists", async () => {
  await fs.mkdir("storage/1/1/1", { recursive: true });
  await fs.writeFile("storage/1/1/1/test.png", "test");
  await expect(staticFileManager.readFile(1, 1, 1, "test.png")).resolves.toBeInstanceOf(Buffer);
});

test("return error when reading images which do not exist", async () => {
  await expect(staticFileManager.readFiles(1, 1, 1)).rejects.toThrowError("path not found");
});

test("read images which exist", async () => {
  await fs.mkdir("storage/1/1/1", { recursive: true });
  await fs.writeFile("storage/1/1/1/test.png", "test");
  await fs.writeFile("storage/1/1/1/test2.png", "test");
  await expect(staticFileManager.readFiles(1, 1, 1)).resolves.toBeInstanceOf(Array);
});

test("return error when deleting image which does not exist", async () => {
  await expect(staticFileManager.deleteFile(1, 1, 1, "test.png")).rejects.toThrowError("path not found");
});

test("delete image which exists", async () => {
  await fs.mkdir("storage/1/1/1", { recursive: true });
  await fs.writeFile("storage/1/1/1/test.png", "test");
  await expect(staticFileManager.deleteFile(1, 1, 1, "test.png")).resolves.toBeUndefined();
  const files = await fs.readdir("storage/1/1/1");
  expect(files).toHaveLength(0);
});

test("return error when deleting images which do not exist", async () => {
  await expect(staticFileManager.deleteFiles(1, 1, 1)).rejects.toThrowError("path not found");
});

test("delete images which exist", async () => {
  await fs.mkdir("storage/1/1/1", { recursive: true });
  await fs.writeFile("storage/1/1/1/test.png", "test");
  await fs.writeFile("storage/1/1/1/test2.txt", "test");
  await expect(staticFileManager.deleteFiles(1, 1, 1)).resolves.toBeUndefined();
  const files = await fs.readdir("storage/1/1/1");
  expect(files).toHaveLength(1);
});

beforeEach(async () => {
  await emptyDir();
});

afterAll(async () => {
  await emptyDir();
});
