// import { Image } from "expo-image";
import { StyleSheet, View, Button, Text } from "react-native";

// import { Collapsible } from "@/components/Collapsible";
// import { ExternalLink } from "@/components/ExternalLink";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
// import { IconSymbol } from "@/components/ui/IconSymbol";

import React, { useState } from "react";

import i18n from "@/constants/translations";

export default function SettingsScreen() {
  const [currentLocale, setCurrentLocale] = useState(i18n.locale);

  const changeLanguage = (locale) => {
    i18n.locale = locale;
    setCurrentLocale(locale); 
  };

  return (
    <ThemedView>
      <ThemedText>Aktuální jazyk: {currentLocale}</ThemedText>
      <Button
        title="Čeština"
        onPress={() => changeLanguage("cs")}
        disabled={currentLocale === "cs"}
      />
      <Button
        title="English"
        onPress={() => changeLanguage("en")}
        disabled={currentLocale === "en"}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({

});
