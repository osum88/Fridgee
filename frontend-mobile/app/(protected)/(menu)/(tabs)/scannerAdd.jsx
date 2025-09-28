import { CameraView } from "expo-camera";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, StatusBar, Pressable, View } from "react-native";
import i18n from "@/constants/translations";
import { ThemedView } from "@/components/themed/ThemedView";
import { ThemedText } from "@/components/themed/ThemedText";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { IconSymbol } from "@/components/icons/IconSymbol";
import { responsiveSize } from "@/utils/scale";

import { ScannerOverlay } from "@/components/scanner/ScannerOverlay";

export default function ScannerAdd() {
  const [scanned, setScanned] = useState(false);
  const [lastScannedData, setLastScannedData] = useState(null);
  const [countSameScannedData, setCountSameScannedData] = useState(0);
  const [facing, setFacing] = useState(false);
  const [torch, setTorch] = useState(false);
  const isFocused = useIsFocused();

  //vypne baterku pokud je zapla predni obrazovka
  useEffect(() => {
    if (facing) setTorch(false);
  }, [facing]);

  //pri odchodu z view se baterka vypne
  useFocusEffect(
    useCallback(() => {
      return () => {
        setTorch(false);
        setScanned(false);
      };
    }, [])
  );

  useEffect(() => {
    if (scanned) {
      const timeout = setTimeout(() => setScanned(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [scanned]);

  const handleCodeScanned = ({ type, data }) => {
    if (scanned) return;
    if (lastScannedData?.type === type && lastScannedData?.data === data) {
      setCountSameScannedData((prev) => {
        const newCount = prev + 1;

        if (newCount >= 4) {
          console.log("Scanned is:", type, data, newCount);

          setCountSameScannedData(0);
          setScanned(true);
          alert(`Naskenováno: ${data}`);
        }
        return newCount;
      });
    } else {
      setCountSameScannedData(0);
    }
    setLastScannedData({ type, data });
  };

  return (
    <ThemedView
      safe={true}
      style={[styles.container, StyleSheet.absoluteFillObject]}
    >
      {isFocused && (
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="light-content"
        />
      )}

      <CameraView
        facing={facing ? "front" : "back"}
        enableTorch={torch}
        autofocus="off"
        onBarcodeScanned={handleCodeScanned}
        barCodeScannerSettings={{
          barCodeTypes: [
            "aztec",
            "ean13",
            "ean8",
            "qr",
            "pdf417",
            "upc_e",
            "datamatrix",
            "code39",
            "code93",
            "itf14",
            "codabar",
            "code128",
            "upc_a",
          ],
        }}
        onMountError={(error) => {
          console.error("Error camera:", error.message);
        }}
        style={StyleSheet.absoluteFillObject}
      />

      <ScannerOverlay />

      <View style={styles.iconContainer}>
        <Pressable
          onPress={() => {
            setTorch((prev) => {
              return !prev;
            });
          }}
        >
          <IconSymbol
            size={responsiveSize.moderate(28)}
            name={torch ? "bolt.fill" : "bolt.slash.fill"}
            color={"#f5f5f5"}
          />
        </Pressable>
        <Pressable
          onPress={() => {
            setFacing((prev) => {
              return !prev;
            });
          }}
        >
          <IconSymbol
            size={responsiveSize.moderate(28)}
            name="camera.rotate"
            color={"#f5f5f5"}
          />
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  iconContainer: {
    marginTop: responsiveSize.vertical(15),
    flexDirection: "row",
    justifyContent: "center",
    gap: responsiveSize.horizontal(40),
  },
});
