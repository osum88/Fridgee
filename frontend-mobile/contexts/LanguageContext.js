import React, { createContext, useContext, useState, useEffect } from "react";
import i18n from "@/constants/translations";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const LanguageContext = createContext();

export function useLanguage() {
    const context = useContext(LanguageContext);
        if (context === undefined) {
            throw new Error('useLanguage must be used within a LanguageProvider');
        }
    return context;
}

export function LanguageProvider({ children }) {
    const [isLanguageLoaded, setIsLanguageLoaded] = useState(false);
    const [locale, setLocale] = useState(i18n.locale);

    useEffect(() => {
        const loadLanguage = async () => {
        try {
            const storedLanguage = await AsyncStorage.getItem("selected_language");
            if (storedLanguage) {
            i18n.locale = storedLanguage;
            setLocale(storedLanguage);
            }
        } catch (error) {
            console.error("Error loading language from storage:", error);
        } finally {
            setIsLanguageLoaded(true);
        }
        };
        loadLanguage();
    }, []);



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
        <LanguageContext.Provider value={{ isLanguageLoaded, locale, setAppLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};