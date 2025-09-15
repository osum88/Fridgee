import { useImagePicker } from "@/hooks/image/useImagePicker";
import { useImageCompressor } from "@/hooks/image/useImageCompressor";
import useUpdateUserProfileImageMutation from "@/hooks/user/useUpdateUserProfileImageMutation";

export const useImageUpload = () => {
  const { pickImage, takePhoto } = useImagePicker();
  const { compressImage } = useImageCompressor({
    width: 1024,
    compressSize: 0.9,
  });
  
  const { updateUserProfileImageMutation, isLoading } =
    useUpdateUserProfileImageMutation();

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

    updateUserProfileImageMutation.mutate(formData)
  };

  return { pickImage, takePhoto, uploadImage };
};
