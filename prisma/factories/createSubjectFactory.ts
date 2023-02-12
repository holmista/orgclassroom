import db from "../../lib/database.js";

async function createSubject(
  userId: number,
  startTime: string,
  endTime: string,
  title: string
) {
  return await db.subject.create({
    data: {
      userId,
      startTime: "1400",
      endTime: "1500",
      title: "test",
    },
  });
}

export default createSubject;
