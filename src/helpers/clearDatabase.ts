import db from "../../lib/database.js";

export default async function clearDatabase() {
  await db.session.deleteMany();
  await db.note.deleteMany();
  await db.subject.deleteMany();
  await db.user.deleteMany();
}
