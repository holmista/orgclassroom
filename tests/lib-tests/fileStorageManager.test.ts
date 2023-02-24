import { test, expect, beforeEach, afterAll } from "@jest/globals";
import FileStorageManager from "../../lib/fileStorageManager";
import fs from "fs/promises";
import emptyDir from "../../src/helpers/emptyDir";

const fileStorageManager = FileStorageManager.getInstance();

test("return error if path not found when writing a file", async () => {
  await expect(fileStorageManager.writeFile(1, 1, 1, "test.txt", Buffer.from("test"))).rejects.toThrow(
    "path not found"
  );
});

test("write file if path found when writing a file", async () => {
  await fs.mkdir("storage/1/1/1", { recursive: true });
  await expect(fileStorageManager.writeFile(1, 1, 1, "test.txt", Buffer.from("test"))).resolves.toBeUndefined();
  await expect(fs.readFile("storage/1/1/1/test.txt")).resolves.toEqual(Buffer.from("test"));
});

test("return error if path not found when reading a file", async () => {
  await expect(fileStorageManager.readFile(1, 1, 1, "test.txt")).rejects.toThrow("path not found");
});

test("read file if path found when reading a file", async () => {
  await fs.mkdir("storage/1/1/1", { recursive: true });
  await fs.writeFile("storage/1/1/1/test.txt", Buffer.from("test"));
  await expect(fileStorageManager.readFile(1, 1, 1, "test.txt")).resolves.toEqual(Buffer.from("test"));
});

test("return error if path not found when reading files", async () => {
  await expect(fileStorageManager.readFiles(1, 1, 1)).rejects.toThrow("path not found");
});

test("read files if path found when reading files", async () => {
  await fs.mkdir("storage/1/1/1", { recursive: true });
  await fs.writeFile("storage/1/1/1/test.txt", Buffer.from("test"));
  await fs.writeFile("storage/1/1/1/test2.txt", Buffer.from("test2"));
  await expect(fileStorageManager.readFiles(1, 1, 1)).resolves.toEqual([Buffer.from("test"), Buffer.from("test2")]);
});

test("return error if path not found when deleting a file", async () => {
  await expect(fileStorageManager.deleteFile(1, 1, 1, "test.txt")).rejects.toThrow("path not found");
});

test("delete file if path found when deleting a file", async () => {
  await fs.mkdir("storage/1/1/1", { recursive: true });
  await fs.writeFile("storage/1/1/1/test.txt", Buffer.from("test"));
  await expect(fileStorageManager.deleteFile(1, 1, 1, "test.txt")).resolves.toBeUndefined();
  await expect(fs.access("storage/1/1/1/test.txt")).rejects.toThrow("no such file or directory");
});

test("do not recreate a folder if it already exists when creating a user folder", async () => {
  await fs.mkdir("storage/1", { recursive: true });
  await fs.writeFile("storage/1/test.txt", Buffer.from("test"));
  await expect(fileStorageManager.createUserFolder(1)).resolves.toBeUndefined();
  const amount = await fs.readdir("storage/1");
  expect(amount.length).toBe(1);
});

test("throw error when deleting a user folder that does not exist", async () => {
  await expect(fileStorageManager.deleteUserFolder(1)).rejects.toThrow("path not found");
});

test("create folder when creating a user folder which does not exist", async () => {
  await expect(fileStorageManager.createUserFolder(1)).resolves.toBeUndefined();
});

test("delete folder when deleting a user folder which exists", async () => {
  await fs.mkdir("storage/1", { recursive: true });
  await expect(fileStorageManager.deleteUserFolder(1)).resolves.toBeUndefined();
});

test("do not recreate a folder if it already exists when creating a subject folder", async () => {
  await fs.mkdir("storage/1/1", { recursive: true });
  await fs.writeFile("storage/1/1/test.txt", Buffer.from("test"));
  await expect(fileStorageManager.createSubjectFolder(1, 1)).resolves.toBeUndefined();
  const amount = await fs.readdir("storage/1/1");
  expect(amount.length).toBe(1);
});

test("throw error when creating a subject folder and user folder does not exist", async () => {
  await expect(fileStorageManager.createSubjectFolder(1, 1)).rejects.toThrow("path not found");
});

test("throw error when deleting a subject folder that does not exist", async () => {
  await expect(fileStorageManager.deleteSubjectFolder(1, 1)).rejects.toThrow("path not found");
});

test("throw error when deleting a subject folder and user folder does not exist", async () => {
  await expect(fileStorageManager.deleteSubjectFolder(1, 1)).rejects.toThrow("path not found");
});

test("create folder when creating a subject folder which does not exist and user exists", async () => {
  await fs.mkdir("storage/1", { recursive: true });
  await expect(fileStorageManager.createSubjectFolder(1, 1)).resolves.toBeUndefined();
});

test("delete folder when deleting a subject folder which exists and user exists", async () => {
  await fs.mkdir("storage/1/1", { recursive: true });
  await expect(fileStorageManager.deleteSubjectFolder(1, 1)).resolves.toBeUndefined();
});

beforeEach(async () => {
  await emptyDir();
});

afterAll(async () => {
  await emptyDir();
});
