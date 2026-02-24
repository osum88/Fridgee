import { useImagePicker } from "@/hooks/image/useImagePicker";
import { useImageCompressor } from "@/hooks/image/useImageCompressor";

export const useImageUpload = (cameraType = "front") => {
  const { pickImage, takePhoto } = useImagePicker(cameraType);
  const { compressImage } = useImageCompressor({
    width: 1024,
    compressSize: 0.9,
  });

  const uploadImage = async (uri) => {
    const compressedUri = await compressImage(uri);
    const filename = compressedUri.split("/").pop();

    //meta data obrazku
    const formData = new FormData();
    formData.append("file", {
      uri: compressedUri,
      name: filename,
      type: "image/webp",
    });

    return { formData, uri: compressedUri };
  };

  return { pickImage, takePhoto, uploadImage };
};
