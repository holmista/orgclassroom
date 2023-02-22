import db from "../../lib/database.js";

async function createSubject(
  userId: number,
  startTime: string = "1400",
  endTime: string = "1500",
  title: string = "test"
) {
  return await db.subject.create({
    data: {
      userId,
      startTime: startTime,
      endTime: endTime,
      title: title,
    },
  });
}

export default createSubject;
