import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { IMAGEKIT_URL_ENDPOINT } from "@/config/config";
import { downloadImage } from "@/utils/imageDownload";

export const useCachedProfileImage = (userId, isLoading, userData) => {
  const [cacheProfileImage, setCacheProfileImage] = useState(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const profilePictureUrl = userData?.profilePictureUrl;

  useEffect(() => {
    const loadProfileImageToCache = async () => {
      //pokud jeste fotka neni nactena
      if (isImageLoaded) return;

      const imageTime = await AsyncStorage.getItem("PROFILE_IMAGE_UPDATE");

      //pokud uz jsou data z db nactena
      if (!isLoading && userData) {
        setIsImageLoaded(true);

        //pokud v db neni odkaz fotky, pak ji odstranim z lokalniho uloziste
        if (profilePictureUrl === "none" || !profilePictureUrl) {
          if (imageTime) {
            await AsyncStorage.removeItem("PROFILE_IMAGE_UPDATE");
          }
          setCacheProfileImage(null);
          return;
        }

        let filePath;
        const fullUrl = `${IMAGEKIT_URL_ENDPOINT}${profilePictureUrl}?v=${Date.now()}`;

        //pokud odkaz na fotku neni stejny (update cas) jako ten ulozeny lokalne, pak ji stahnu
        if (profilePictureUrl !== imageTime) {
         
          filePath = await downloadImage(
            fullUrl,
            "profile",
            `profile_${userId}.webp`,
            true
          );
          await AsyncStorage.setItem("PROFILE_IMAGE_UPDATE", profilePictureUrl);
          //pokud je stejny pak jen vratim cestu k lokalnimu ulozisti
        } else {
          filePath = await downloadImage(
            fullUrl,
            "profile",
            `profile_${userId}.webp`,
            false
          );
        }
        setCacheProfileImage(filePath);
      }
    };

    loadProfileImageToCache();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, profilePictureUrl]);

  return {
    cacheProfileImage,
  };
};
