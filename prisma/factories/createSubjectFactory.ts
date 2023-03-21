import db from "../../lib/database.js";
import { Day } from "@prisma/client";

async function createSubject(
  userId: number,
  startTime: string = "1400",
  endTime: string = "1500",
  title: string = "test",
  day: Day = "monday"
) {
  return await db.subject.create({
    data: {
      userId,
      startTime: startTime,
      endTime: endTime,
      title: title,
      day: day,
    },
  });
}

export default createSubject;
