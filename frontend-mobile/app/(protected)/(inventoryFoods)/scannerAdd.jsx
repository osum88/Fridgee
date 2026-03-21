import { CameraView } from "expo-camera";
import { useCallback, useEffect, useState } from "react";
import {
  StyleSheet,
  StatusBar,
  Pressable,
  View,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { ThemedView } from "@/components/themed/ThemedView";
import { ThemedText } from "@/components/themed/ThemedText";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { IconSymbol } from "@/components/icons/IconSymbol";
import { responsiveFont, responsiveSize } from "@/utils/scale";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScannerOverlay } from "@/components/scanner/ScannerOverlay";
import { useNavigation, router, useLocalSearchParams } from "expo-router";
import { useThemeColor } from "@/hooks/colors/useThemeColor";
import { useGetFoodByBarcodeQuary } from "@/hooks/queries/food/useGetFoodQuary";
import { ActivityIndicator } from "react-native-paper";
import { useInventoryStore } from "@/hooks/store/useInventoryStore";
import i18n from "@/constants/translations";
import * as Haptics from "expo-haptics";

export default function ScannerAddScreen() {
  const [scanned, setScanned] = useState(false);
  const [lastScannedData, setLastScannedData] = useState(null);
  const [countSameScannedData, setCountSameScannedData] = useState(0);
  const [facing, setFacing] = useState(false);
  const [torch, setTorch] = useState(false);
  const [cameraKey, setCameraKey] = useState(0);
  const [cameraOverlay, setCameraOverlay] = useState(1000);
  const [isReady, setIsReady] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [lastBarcode, setLastBarcode] = useState(null);
  const [cameraLayout, setCameraLayout] = useState({ width: 0, height: 0 });

  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const currentColors = useThemeColor();
  const insets = useSafeAreaInsets();
  const activeInventory = useInventoryStore((state) => state.activeInventory);
  const { type } = useLocalSearchParams();

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
    }, []),
  );

  // zabraneni cerne obrazovky kamery pri inicializaci layoutu
  useEffect(() => {
    let timer;
    if (isFocused) {
      timer = setTimeout(() => {
        setIsReady(true);
        setCameraKey((prev) => prev + 1);
        setCameraOverlay((prev) => prev + 1);
      }, 200);
    } else {
      setIsReady(false);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isFocused]);

  // debounce pro uspesny sken
  useEffect(() => {
    if (scanned) {
      const timeout = setTimeout(() => setScanned(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [scanned]);

  //ziska data pro barcode
  const {
    data: foodData,
    isFetching,
    isError,
  } = useGetFoodByBarcodeQuary(lastBarcode, activeInventory.id, !!lastBarcode && type === "add");

  useEffect(() => {
    // produkt nalezen v katalogu
    if (lastBarcode) {
      if (type === "add") {
        if (foodData?.data && !isFetching) {
          router.replace({
            pathname: "../addFoodManually",
            params: {
              barcode: lastBarcode,
              initialData: JSON.stringify(foodData?.data),
            },
          });
          setLastBarcode(null);
        }

        // produkt NENALEZEN
        if ((!foodData?.data || isError) && !isFetching) {
          console.log("Product don't finded");
          router.replace({
            pathname: "../addFoodManually",
            params: {
              barcode: lastBarcode,
            },
          });
          setLastBarcode(null);
        }
      } else if (type === "consume") {
        router.replace({
          pathname: "../consumeBarcode",
          params: {
            barcode: lastBarcode,
          },
        });
        setLastBarcode(null);
      }
    }
  }, [foodData, isFetching, isError, lastBarcode, type]);

  //overi ze naskenovany kod je spravne (3x zasebou stejny kod) a nastavi ji do inputu
  const handleCodeScanned = ({ type, data }) => {
    if (scanned) return;
    if (lastScannedData?.type === type && lastScannedData?.data === data) {
      setCountSameScannedData((prev) => {
        const newCount = prev + 1;

        if (newCount >= 3) {
          setCountSameScannedData(0);
          setScanned(true);
          setManualCode(data);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }
        return newCount;
      });
    } else {
      setCountSameScannedData(0);
    }
    setLastScannedData({ type, data });
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.container}>
            {isFocused && (
              <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
            )}

            {/* kamera a overlay */}
            <View
              style={styles.cameraContainer}
              onLayout={(event) => {
                const { width, height } = event.nativeEvent.layout;
                setCameraLayout({ width, height });
              }}
            >
              {isReady && isFocused ? (
                <CameraView
                  key={cameraKey}
                  facing={facing ? "front" : "back"}
                  enableTorch={torch}
                  autofocus="on"
                  onBarcodeScanned={handleCodeScanned}
                  zoom={0}
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
              ) : (
                <View style={[StyleSheet.absoluteFillObject, { backgroundColor: "#000" }]} />
              )}

              <ScannerOverlay
                key={cameraOverlay}
                containerWidth={cameraLayout.width}
                containerHeight={cameraLayout.height}
              />

              {/* horni lista s ovládanim */}
              <View
                style={[
                  styles.headerContainer,
                  { marginTop: insets.top + responsiveSize.vertical(3) },
                ]}
              >
                <Pressable
                  onPress={() => navigation.goBack()}
                  style={styles.backButton}
                  hitSlop={20}
                >
                  <IconSymbol
                    name="arrow.left"
                    size={responsiveSize.moderate(28)}
                    color="#f5f5f5"
                  />
                </Pressable>
                <View style={styles.centerIcons}>
                  <Pressable onPress={() => setTorch((prev) => !prev)}>
                    <IconSymbol
                      size={responsiveSize.moderate(28)}
                      name={torch ? "bolt.fill" : "bolt.slash.fill"}
                      color="#f5f5f5"
                    />
                  </Pressable>
                  <Pressable onPress={() => setFacing((prev) => !prev)}>
                    <IconSymbol
                      size={responsiveSize.moderate(28)}
                      name="camera.rotate"
                      color="#f5f5f5"
                    />
                  </Pressable>
                </View>
              </View>
            </View>

            {/* spodni lista s manualnim vstupem */}
            <ThemedView style={[styles.footerContainer, { marginBottom: insets.bottom }]}>
              <View style={styles.manualInputRow}>
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: currentColors.background,
                      borderColor: currentColors.outline,
                    },
                  ]}
                >
                  <IconSymbol
                    name="barcode"
                    size={24}
                    color={currentColors.icon}
                    style={styles.barcodeIcon}
                  />
                  <TextInput
                    style={[styles.manualInput, { color: currentColors.text }]}
                    placeholder={i18n.t("enterManually")}
                    placeholderTextColor={currentColors.icon}
                    value={manualCode}
                    onChangeText={setManualCode}
                    keyboardType="numeric"
                    onBlur={() => Keyboard.dismiss()}
                  />
                </View>
                <Pressable
                  style={[
                    styles.submitButton,
                    {
                      backgroundColor: manualCode ? currentColors.primary : currentColors.inputText,
                    },
                  ]}
                  onPress={() => setLastBarcode(manualCode)}
                >
                  {lastBarcode ? (
                    <ActivityIndicator size="small" color={currentColors.onPrimary} />
                  ) : (
                    <IconSymbol name="arrow.right" size={28} color={currentColors.onPrimary} />
                  )}
                </Pressable>
              </View>

              <Pressable
                style={[styles.cancelButton, { borderColor: currentColors.primary }]}
                onPress={() => navigation.goBack()}
              >
                <ThemedText style={styles.cancelText}>{i18n.t("cancelScanning")}</ThemedText>
              </Pressable>
            </ThemedView>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
  },
  cameraContainer: {
    flex: 1,
    overflow: "hidden",
    position: "relative",
  },
  headerContainer: {
    position: "absolute",
    top: responsiveSize.vertical(15),
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  backButton: {
    position: "absolute",
    left: responsiveSize.horizontal(15),
  },
  centerIcons: {
    flexDirection: "row",
    gap: responsiveSize.horizontal(40),
  },
  footerContainer: {
    paddingTop: responsiveSize.vertical(22),
    paddingBottom: responsiveSize.vertical(18),
    paddingHorizontal: responsiveSize.horizontal(16),
    gap: responsiveSize.vertical(17),
    zIndex: 20,
  },
  manualInputRow: {
    flexDirection: "row",
    width: "100%",
    gap: responsiveSize.horizontal(8),
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    borderRadius: responsiveSize.moderate(11),
    alignItems: "center",
    paddingHorizontal: responsiveSize.horizontal(10),
    height: responsiveSize.vertical(48),
    borderWidth: 1,
  },
  barcodeIcon: {
    marginRight: responsiveSize.horizontal(4),
  },
  manualInput: {
    flex: 1,
    fontSize: responsiveFont(16),
  },
  submitButton: {
    width: responsiveSize.horizontal(50),
    height: responsiveSize.vertical(48),
    borderRadius: responsiveSize.moderate(11),
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    width: "100%",
    height: responsiveSize.vertical(43),
    borderWidth: 1.5,
    borderRadius: responsiveSize.moderate(11),
    justifyContent: "center",
    alignItems: "center",
  },
  cancelText: {
    fontWeight: "bold",
    fontSize: responsiveFont(15),
  },
});
