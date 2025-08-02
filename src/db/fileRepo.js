const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

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
    console.log("Found files ");
    return files;
  } catch (error) {
    console.log("Error while querying all files for folder id ", error);
    throw error;
  }
};

const getAllFilesWithNoFolderByUserId = async (id) => {
  console.log("Query all file which does not belong to any folders");
  try {
    const files = await prisma.file.findMany({
      where: { folderId: null, ownerId: id },
    });
    console.log("Found files, ");
    return files;
  } catch (error) {
    console.log("Error while query file with no folder ", error);
    throw error;
  }
};

module.exports = {
  createFile,
  getAllFilesByUserId,
  getAllFilesByFolderId,
  getAllFilesWithNoFolderByUserId,
};
