import { useImagePicker } from "@/hooks/image/useImagePicker";
import { useImageCompressor } from "@/hooks/image/useImageCompressor";

export const useImageUpload = () => {
  const { pickImage, takePhoto } = useImagePicker();
  const { compressImage } = useImageCompressor({
    width: 1024,
    compressSize: 0.9,
  });

  const uploadImage = async (uri) => {

    const compressedUri = await compressImage(uri);

    // setImage1(compressedUri);
    const filename = compressedUri.split("/").pop();

    const newFilename = filename.replace(/\.[^/.]+$/, `.jpeg`);

    //meta data obrazku
    const formData = new FormData();
    formData.append("image", {
      uri,
      name: newFilename,
      type: "image/jpeg",
    });
  };

  return { pickImage, takePhoto, uploadImage };
};
