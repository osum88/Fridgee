import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import i18n from "@/constants/translations";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocales } from "expo-localization";

export const LanguageContext = createContext();

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

export function LanguageProvider({ children, user, isUserLoggedIn }) {
  const [isLanguageLoaded, setIsLanguageLoaded] = useState(false);
  const [locale, setLocale] = useState(i18n.locale);

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        setIsLanguageLoaded(false);

        let languageToSet;
        const storedLanguage = await AsyncStorage.getItem("selected_language");

        if (storedLanguage) {
          //pokud je remmeber me true
          languageToSet = storedLanguage;
        } else if (isUserLoggedIn && user?.preferredLanguage) {
          //pokud se prihlasuje
          languageToSet = user.preferredLanguage;
          await AsyncStorage.setItem("selected_language", languageToSet);
        } else {
          // kdyz neni prihlasen
          languageToSet = getLocales()[0].languageCode ?? "en";
        }

        i18n.locale = languageToSet;
        setLocale(languageToSet);
      } catch (error) {
        console.error("Error loading language:", error);
      } finally {
        setIsLanguageLoaded(true);
      }
    };
    loadLanguage();
  }, [isUserLoggedIn, user]);

  const setAppLanguage = async (newLocale) => {
    try {
      i18n.locale = newLocale;
      await AsyncStorage.setItem("selected_language", newLocale);
      setLocale(newLocale);
    } catch (error) {
      console.error("Error setting language:", error);
    }
  };

  return (
    <LanguageContext.Provider
      value={{ isLanguageLoaded, locale, setAppLanguage }}
    >
      {children}
    </LanguageContext.Provider>
  );
}
