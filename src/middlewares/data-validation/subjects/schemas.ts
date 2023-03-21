import { z } from "zod";
import isValidTime from "../../../helpers/isValidTime.js";

export const CreateSubjectSchema = z
  .object({
    startTime: z
      .string({
        required_error: "start time is required",
        invalid_type_error: "start time must be a string"
      })
      .length(4, { message: "start time must be 4 characters long" })
      .refine((val) => isValidTime(val), {
        message: "end time must be a valid time"
      }),
    endTime: z
      .string({
        required_error: "end time is required",
        invalid_type_error: "end time must be a string"
      })
      .length(4, { message: "end time must be 4 characters long" })
      .refine((val) => isValidTime(val), {
        message: "end time must be a valid time"
      }),
    title: z.string().max(100, { message: "title must be less than 100 characters long" })
  })
  .refine((data) => parseInt(data.startTime) < parseInt(data.endTime), {
    message: "start time must be less than end time",
    path: ["startTime"]
  });

export const UpdateSubjectSchema = z
  .object({
    startTime: z
      .string({
        required_error: "start time is required",
        invalid_type_error: "start time must be a string"
      })
      .length(4, { message: "start time must be 4 characters long" })
      .optional(),
    endTime: z
      .string({
        required_error: "end time is required",
        invalid_type_error: "end time must be a string"
      })
      .length(4, { message: "end time must be 4 characters long" })
      .optional(),
    title: z.string().max(100, { message: "title must be less than 100 characters long" }).optional()
  })
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        return parseInt(data.startTime) < parseInt(data.endTime);
      }
      return true;
    },
    {
      message: "start time must be less than end time",
      path: ["startTime"]
    }
  )
  .refine(
    (data) => {
      if (data.startTime || data.endTime || data.title) {
        return true;
      }
      return false;
    },
    {
      message: "at least one field must be provided",
      path: ["startTime"]
    }
  );

type CreateSubject = z.infer<typeof CreateSubjectSchema>;
type UpdateSubject = z.infer<typeof UpdateSubjectSchema>;
export type { CreateSubject, UpdateSubject };
