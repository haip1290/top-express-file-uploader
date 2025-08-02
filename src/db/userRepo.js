const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createUser = async ({ email, hashedPassword }) => {
  console.log("Inserting user into DB");
  try {
    const user = await prisma.user.create({
      data: { email: email, password: hashedPassword },
    });
    console.log("Created user ", user);
  } catch (error) {
    console.error("Error creating user");
    throw error;
  }
};

const getUserById = async (id) => {
  console.log("Query user by id");
  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: {
        id: id,
      },
    });
    console.log("Found user");
    return user;
  } catch (error) {
    console.error("Error query user by id ", error);
    throw error;
  }
};

const getUserByEmail = async (email) => {
  console.log("Queries user by email");
  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: {
        email: email,
      },
    });
    console.log("Found user with email ");
    return user;
  } catch (error) {
    console.error("Error query user by email ", error);
    throw error;
  }
};

module.exports = { createUser, getUserByEmail, getUserById };
