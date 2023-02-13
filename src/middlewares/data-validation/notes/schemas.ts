import { z } from "zod";

export const CreateNoteSchema = z.object({
  subjectId: z
    .number({
      required_error: "subject id is required",
      invalid_type_error: "subject id must be an integer",
    })
    .int({ message: "subject id must be an integer" })
    .positive({ message: "subject id must be a positive integer" }),
  title: z
    .string({
      required_error: "title is required",
      invalid_type_error: "title must be a string",
    })
    .max(191, { message: "title must be less than 191 characters long" }),
  content: z
    .string({
      required_error: "content is required",
      invalid_type_error: "content must be a string",
    })
    .max(16000, { message: "content must be less than 16000 characters long" }),
});

export const updateNoteSchema = z
  .object({
    subjectId: z
      .number({
        required_error: "subject id is required",
        invalid_type_error: "subject id must be an integer",
      })
      .int({ message: "subject id must be an integer" })
      .positive({ message: "subject id must be a positive integer" })
      .optional(),
    title: z
      .string({
        required_error: "title is required",
        invalid_type_error: "title must be a string",
      })
      .max(191, { message: "title must be less than 191 characters long" })
      .optional(),
    content: z
      .string({
        required_error: "content is required",
        invalid_type_error: "content must be a string",
      })
      .max(16000, {
        message: "content must be less than 16000 characters long",
      })
      .optional(),
  })
  .refine(
    (data) => {
      if (data.subjectId || data.title || data.content) {
        return true;
      }
      return false;
    },
    { message: "at least one field must be provided", path: ["subjectId"] }
  );
