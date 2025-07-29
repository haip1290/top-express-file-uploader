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

const createFolder = async ({ name, ownerId }) => {
  console.log("Insert folder into database");
  try {
    await prisma.folder.create({
      data: { name: name, owner: { connect: { id: ownerId } } },
    });
    console.log("Created folder");
  } catch (error) {
    console.error("Error inserting folder into database ", error);
    throw error;
  }
};

const getAllFolderByUserId = async (userId) => {
  console.log("Query folder by user Id ", userId);
  try {
    const folders = await prisma.folder.findMany({
      where: { ownerId: userId },
    });
    console.log("Found folders", folders);
    return folders;
  } catch (error) {
    console.error("Error while querying folders by user Id ", error);
    throw error;
  }
};

const getFolderByFolderId = async (folderId) => {
  console.log("Query folder by id");
  try {
    const folder = await prisma.folder.findUniqueOrThrow({
      where: { id: folderId },
    });
    console.log("Found folder ", folder);
    return folder;
  } catch (error) {
    console.error("Error while querying folder by id ", error);
    throw error;
  }
};

const createFile = async ({ name, ownerId, folderId }) => {
  console.log("Insert file into database");
  try {
    const file = await prisma.file.create({
      data: {
        name,
        owner: { connect: { id: ownerId } },
        ...(folderId && { folder: { connect: { id: folderId } } }),
      },
    });
    console.log("Created file ", file);
  } catch (error) {
    console.error("Error while creating file ", error);
    throw error;
  }
};

const getAllFilesByUserId = async (userId) => {
  console.log("Query files by user Id ", userId);
  try {
    const files = await prisma.file.findMany({ where: { ownerId: userId } });
    console.log("Found all files by user id");
    return files;
  } catch (error) {
    console.error("Error while querying files by user Id ", error);
    throw error;
  }
};

const getAllFilesByFolderId = async (folderId) => {
  console.log("Query all files for folder id ", folderId);
  try {
    const files = await prisma.file.findMany({ where: { folderId: folderId } });
    console.log("Found files ", files);
    return files;
  } catch (error) {
    console.log("Error while querying all files for folder id ", error);
    throw error;
  }
};

const getAllFilesWithNoFolder = async () => {
  console.log("Query all file which does not belong to any folders");
  try {
    const files = await prisma.file.findMany({ where: { folderId: null } });
    console.log("Found files, ", files);
    return files;
  } catch (error) {
    console.log("Error while query file with no folder ", error);
    throw error;
  }
};

module.exports = {
  createUser,
  getUserByEmail,
  getUserById,
  createFile,
  getAllFilesByUserId,
  createFolder,
  getAllFolderByUserId,
  getAllFilesByFolderId,
  getFolderByFolderId,
  getAllFilesWithNoFolder,
};
