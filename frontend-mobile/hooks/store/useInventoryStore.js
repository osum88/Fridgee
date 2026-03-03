import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

//globalni uloziste pro inventar
export const useInventoryStore = create(
  persist(
    (set) => ({
      activeInventory: { id: null, title: "", role: null },

      setActiveInventory: (id, title, role) => set({ activeInventory: { id, title, role } }),
      clearActiveInventory: () => set({ activeInventory: { id: null, title: "", role: null } }),
    }),
    {
      name: "inventory-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
