import sharp from "sharp";
import imagekit from "../utils/imageKit.js";

//vytvori nazev image
export const generateImageFilename = (
  type,
  userId,
  width,
  height,
  format = "webp",
  showTimestamp = true,
) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  if (showTimestamp) {
    return `${type}_${userId}_${width}x${height}_${timestamp}.${format}`;
  }
  return `${type}_${userId}_${width}x${height}.${format}`;
};

//zmeni velikost image
export const resizeImage = async (image, width, format = "webp") => {
  return await sharp(image.buffer).resize({ width: width }).toFormat(format).toBuffer();
};

//uploaduje image na cloud
export const uploadImageToCloud = async (
  buffer,
  fileName,
  folderPath,
  tags = [],
  overwriteFile = true,
  useUniqueFileName = false,
) => {
  try {
    return await imagekit.upload({
      file: buffer,
      fileName,
      folder: folderPath,
      isPrivateFile: false,
      tags,
      useUniqueFileName: useUniqueFileName,
      overwriteFile: overwriteFile,
    });
  } catch (error) {
    return false;
  }
};

//vrati vsechny image id z folder
export const getEveryFilesIdFromFolderCloud = async (folderPath) => {
  const files = await imagekit.listFiles({
    folder: folderPath,
    limit: 1000,
  });
  return files.map((file) => file.fileId);
};

//smaze vsechny fotky podle ids
export const deleteEveryFilesInFolderCloud = async (fileIds) => {
  if (!fileIds?.length) return true;

  const CHUNK_SIZE = 100;
  let allSuccessful = true;

  // bulk je omezen na 100 ids
  try {
    for (let i = 0; i < fileIds.length; i += CHUNK_SIZE) {
      const chunk = fileIds.slice(i, i + CHUNK_SIZE);
      try {
        await imagekit.bulkDeleteFiles(chunk);
        console.log(`Successfully deleted chunk of ${chunk.length} files.`);
      } catch (error) {
        console.error(`Failed to delete chunk starting at index ${i}:`, error);
        allSuccessful = false;
      }
    }
    return allSuccessful;
  } catch (error) {
    console.error("Bulk deletion failed:", error);
    return false;
  }
};

//smaze fotky z cloudu
export const deleteUserFolderFromCloud = async (folderPath) => {
  const fileIds = await getEveryFilesIdFromFolderCloud(folderPath);
  if (fileIds.length > 0) {
    await deleteEveryFilesInFolderCloud(fileIds);
  }
};

//smaze fotku z cloudu
export const deleteImageFromCloud = async (foodImageCloudId) => {
  try {
    if (!foodImageCloudId) return false;

    await imagekit.deleteFile(foodImageCloudId);
    return true;
  } catch (error) {
    console.error(`ImageKit deletion failed for ID ${foodImageCloudId}:`, error.message);
    return false;
  }
};

//vrati cas updatu fotky z cloudu
export const getImageUpdateTimeFromCloud = async (fileId) => {
  const fileDetails = await imagekit.getFileDetails(fileId);
  return fileDetails.updatedAt;
};
