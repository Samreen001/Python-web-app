"use client"

import { create } from "zustand"

export type Column = {
  id: string
  name: string
  type: "string" | "number"
}

type DataStore = {
  data: Record<string, any>[]
  columns: Column[]
  loading: boolean
  setData: (data: Record<string, any>[]) => void
  setColumns: (columns: Column[]) => void
  setLoading: (loading: boolean) => void
}

export const useDataStore = create<DataStore>((set) => ({
  data: [],
  columns: [],
  loading: false,
  setData: (data) => set({ data }),
  setColumns: (columns) => set({ columns }),
  setLoading: (loading) => set({ loading }),
}))
