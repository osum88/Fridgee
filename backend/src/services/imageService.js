import sharp from "sharp";

//vytvori nazev image
export const generateImageFilename = (type, userId, width, height, format = "webp") => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `${type}_${userId}_${width}x${height}_${timestamp}.${format}`;
}

//zmeni velikost image
export const resizeImage = async (image, width, userId, type, format = "webp") => {
    const resizedBuffer = await sharp(image.buffer)
        .resize({ width: width })
        .toFormat(format)
        .toBuffer();

    const filename = generateImageFilename(type, userId, width, width, format);
   
    return {
        buffer: resizedBuffer,
        filename: filename,
        mimetype: image.mimetype,
        size: resizedBuffer.length,
        metadata: {
            width: width,
            height: width,
            format: format,
            uploadedBy: userId,
            type: type,
            uploadedAt: new Date().toISOString(),
        },
    };
}