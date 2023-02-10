import { z } from "zod";

export const CreateSubjectSchema = z.object({
  startTime: z.string().length(4),
  endTime: z.string().length(4),
  title: z.string().max(100),
});

export const UpdateSubjectSchema = z.object({
  startTime: z.string().length(4).optional(),
  endTime: z.string().length(4).optional(),
  title: z.string().max(100).optional(),
});

type CreateSubject = z.infer<typeof CreateSubjectSchema>;
type UpdateSubject = z.infer<typeof UpdateSubjectSchema>;
export type { CreateSubject, UpdateSubject };
