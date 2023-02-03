import {
  Prisma,
  PrismaClient,
  User,
  Subject,
  Note,
  NoteType,
} from "@prisma/client";
import { faker } from "@faker-js/faker";
const prisma = new PrismaClient();

function createUser() {
  const users: User[] = [];
  const user: User = {
    id: 1,
    email: faker.internet.email(),
    name: faker.name.firstName(),
    authProvider: "google",
    authProviderId: faker.random.alphaNumeric(10),
  };
  users.push(user);
  return users;
}

function createSubjects() {
  const subjects: Subject[] = [];
  for (let i = 1; i < 6; i++) {
    const subject: Subject = {
      id: i,
      userId: 1,
      startTime: faker.date.future(),
      endTime: faker.date.future(),
      title: faker.random.word(),
    };
    subjects.push(subject);
  }
  return subjects;
}

const noteTypes = ["TEXT", "IMAGE", "AUDIO", "VIDEO", "FILE"];

function createNotes() {
  const notes: Note[] = [];
  let id = 1;
  for (let i = 1; i < 6; i++) {
    for (let j = 1; j < 6; j++) {
      const note: Note = {
        id: id,
        subjectId: i,
        title: faker.random.word(),
        type: noteTypes[
          Math.floor(Math.random() * noteTypes.length)
        ] as NoteType,
        content: faker.random.words(30),
      };
      notes.push(note);
      id++;
    }
  }
  return notes;
}

async function main() {
  const notes = createNotes();
  const subjects = createSubjects();
  const users = createUser();
  try {
    await prisma.note.deleteMany();
    await prisma.subject.deleteMany();
    await prisma.user.deleteMany();
    const usersCreated = await prisma.user.createMany({
      data: users,
    });
    const subjectsCreated = await prisma.subject.createMany({
      data: subjects,
    });
    const notesCreated = await prisma.note.createMany({
      data: notes,
    });
    // prisma.$transaction([usersCreated, subjectsCreated, notesCreated]);
  } catch (err) {
    console.log(err);
    console.log(users);
    console.log(subjects);
  }
  // console.log(notes);
  // console.log(subjects);
}
main();
