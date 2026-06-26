import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface ProgressState {
  // Navigation
  lastPath: string;
  setLastPath: (path: string) => void;

  // Diagnose State
  analysisResult: any | null;
  uploadedImage: string | null;
  showHeatmap: boolean;
  showReport: boolean;
  setScanState: (state: Partial<Pick<ProgressState, 'analysisResult' | 'uploadedImage' | 'showHeatmap' | 'showReport'>>) => void;
  resetScan: () => void;

  // Library State
  libraryQuery: string;
  libraryData: any | null;
  setLibraryState: (query: string, data: any | null) => void;
  resetLibrary: () => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      lastPath: '',
      setLastPath: (path) => set({ lastPath: path }),

      analysisResult: null,
      uploadedImage: null,
      showHeatmap: false,
      showReport: false,
      setScanState: (state) => set((prev) => ({ ...prev, ...state })),
      resetScan: () => set({ analysisResult: null, uploadedImage: null, showHeatmap: false, showReport: false }),

      libraryQuery: '',
      libraryData: null,
      setLibraryState: (query, data) => set({ libraryQuery: query, libraryData: data }),
      resetLibrary: () => set({ libraryQuery: '', libraryData: null }),
    }),
    {
      name: 'mediseen-progress-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage),
    }
  )
)
