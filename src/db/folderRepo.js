const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

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
      include: { files: true },
    });
    console.log("Found folder ", folder);
    return folder;
  } catch (error) {
    console.error("Error while querying folder by id ", error);
    throw error;
  }
};

const updateFolder = async ({ id, name, ownerId }) => {
  try {
    console.log(`Updating folder with id ${id} in DB`);
    await prisma.folder.update({ where: { id, ownerId }, data: { name } });
    console.log("Update successfully");
  } catch (error) {
    console.log("Error updating folder");
    throw error;
  }
};

const deleteFolder = async ({ folderId, ownerId }) => {
  try {
    console.log("Deleting folder id ", folderId);
    const deleteFiles = prisma.file.deleteMany({
      where: { folderId, ownerId },
    });
    const deleteFolder = prisma.folder.delete({
      where: { id: folderId, ownerId },
    });
    await prisma.$transaction([deleteFiles, deleteFolder]);
    console.log("Deleting folder successfully");
  } catch (error) {
    console.log("Error deleting folder ", error);
    throw error;
  }
};

module.exports = {
  createFolder,
  getAllFolderByUserId,
  getFolderByFolderId,
  updateFolder,
  deleteFolder,
};
