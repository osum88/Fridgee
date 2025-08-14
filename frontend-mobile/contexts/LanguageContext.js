import React, { createContext, useContext, useState } from "react";
import i18n from "@/constants/translations";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
    const [locale, setLocale] = useState(i18n.locale);

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
        <LanguageContext.Provider value={{ locale, setAppLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};