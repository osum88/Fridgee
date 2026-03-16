import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

//globalni uloziste pro inventar
export const useInventoryStore = create(
  persist(
    (set) => ({
      activeInventory: { id: null, title: "", role: null, memberCount: 1 },

      setActiveInventory: (updates) =>
        set((state) => ({
          activeInventory: { ...state.activeInventory, ...updates },
        })),
      clearActiveInventory: () =>
        set({ activeInventory: { id: null, title: "", role: null, memberCount: 1 } }),
    }),
    {
      name: "inventory-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
