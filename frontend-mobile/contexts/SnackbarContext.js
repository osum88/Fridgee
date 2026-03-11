import { responsiveSize } from "@/utils/scale";
import { createContext, useContext, useState, useCallback } from "react";
import { Snackbar } from "react-native-paper";

const SnackbarContext = createContext(null);

export function SnackbarProvider({ children }) {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");

  const showSnackbar = useCallback((msg) => {
    setMessage(msg);
    setVisible(true);
  }, []);

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        duration={4000}
        style={{ marginBottom: responsiveSize.vertical(30) }}
      >
        {message}
      </Snackbar>
    </SnackbarContext.Provider>
  );
}

export const useSnackbar = () => useContext(SnackbarContext);
