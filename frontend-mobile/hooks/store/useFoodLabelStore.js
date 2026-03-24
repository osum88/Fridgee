import { create } from "zustand";

export const useFoodLabelStore = create((set) => ({
  search: "",
  setSearch: (search) => set({ search }),
  clearSearch: () => set({ search: "" }),
}));