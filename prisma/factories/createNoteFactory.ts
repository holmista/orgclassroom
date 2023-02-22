import db from "../../lib/database.js";
import dotenv from "dotenv";
dotenv.config();

async function createNote(
  subjectId: number,
  title: string = "title",
  content: string = "content"
) {
  return await db.note.create({
    data: {
      subjectId,
      title,
      content,
    },
  });
}

export default createNote;
