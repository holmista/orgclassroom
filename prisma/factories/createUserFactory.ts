import db from "../../lib/database.js";

async function createUser(
  email: string = "test@gmail.com",
  name: string = "test",
  authProvider: string = "google",
  authProviderId: string = "123"
) {
  const user = await db.user.create({
    data: {
      email,
      name,
      authProvider,
      authProviderId,
    },
  });
  return user;
}

export default createUser;
