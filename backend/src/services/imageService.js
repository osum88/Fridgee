import sharp from "sharp";
import imagekit from "../utils/imageKit.js";

//vytvori nazev image
export const generateImageFilename = (type, userId, width, height, format = "webp", showTimestamp = true) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    if (showTimestamp){
        return `${type}_${userId}_${width}x${height}_${timestamp}.${format}`;
    }
    return `${type}_${userId}_${width}x${height}.${format}`;
};

//zmeni velikost image
export const resizeImage = async (image, width, format = "webp") => {
    return await sharp(image.buffer)
        .resize({ width: width })
        .toFormat(format)
        .toBuffer();
};

//uploaduje image na cloud
export const uploadImageToCloud = async (buffer, fileName, folderPath, tags = []) => {
    try {
        const result = await imagekit.upload({
            file: buffer,
            fileName,
            folder: folderPath,
            isPrivateFile: false,
            tags,
            useUniqueFileName: false,
            overwriteFile: true,
        });
        return result
    } catch (error) {
        return false
    }
};

//vrati vsechny image id z folder
export const getEveryFilesIdFromFolderCloud = async (folderPath) => {
    const files = await imagekit.listFiles({
        folder: folderPath,
        limit: 1000,
    });
    return files.map(file => file.fileId);
};

//smaze vsechny fotky ve folder
export const deleteEveryFilesInFolderCloud = async (fileIds) => {
    try {
        await Promise.all(
            fileIds.map(id => imagekit.deleteFile(id))
        );
        return true;  
    } catch (error) {
        return false; 
    }
}

//smaze fotky z cloudu
export const deleteUserFolderFromCloud = async (folderPath) => {
    const fileIds = await getEveryFilesIdFromFolderCloud(folderPath);
    if (fileIds.length > 0) {
        await deleteEveryFilesInFolderCloud(fileIds);
    }
};

export const getImageUpdateTimeFromCloude = async (fileId) => {
    const fileDetails = await imagekit.getFileDetails(fileId);
    return fileDetails.updatedAt;
};
