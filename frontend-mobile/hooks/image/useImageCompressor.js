import * as ImageManipulator from "expo-image-manipulator";
import { File } from "expo-file-system";

export const useImageCompressor = ({ width = 1024, compressSize = 0.9 }) => {
  const compressImage = async (uri) => {
    try {
      const info = new File(uri);
      const isSmall = info.size < 150 * 1024; //pokud je pod 150KB tak nezmensuji
      if (!isSmall) {
        const newResult = await ImageManipulator.manipulateAsync(
          uri,
          [{ resize: { width: width } }],
          {
            compress: compressSize,
            format: ImageManipulator.SaveFormat.WEBP,
          }
        );
        return newResult.uri;
      }
      const result = await ImageManipulator.manipulateAsync(uri, [], {
        format: ImageManipulator.SaveFormat.WEBP,
      });
      return result.uri;
    } catch (error) {
      console.error("Error compressImage:", error);
      return uri;
    }
  };
  return { compressImage };
};
