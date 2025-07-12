import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface UIState {
  // Navigation state
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  
  // Loading states
  globalLoading: boolean
  setGlobalLoading: (loading: boolean) => void
  
  // Theme preferences
  theme: 'light' | 'dark' | 'system'
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  
  // Toast management
  toasts: Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    description?: string
    duration?: number
  }>
  addToast: (toast: Omit<UIState['toasts'][0], 'id'>) => void
  removeToast: (id: string) => void
  clearToasts: () => void
  
  // Modal management
  modals: Record<string, boolean>
  openModal: (modalId: string) => void
  closeModal: (modalId: string) => void
  
  // Form states
  formSubmitting: Record<string, boolean>
  setFormSubmitting: (formId: string, submitting: boolean) => void
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set, get) => ({
        // Navigation state
        sidebarOpen: false,
        setSidebarOpen: (open) => set({ sidebarOpen: open }),
        
        // Loading states
        globalLoading: false,
        setGlobalLoading: (loading) => set({ globalLoading: loading }),
        
        // Theme preferences
        theme: 'system',
        setTheme: (theme) => set({ theme }),
        
        // Toast management
        toasts: [],
        addToast: (toast) => {
          const id = Math.random().toString(36).substr(2, 9)
          set((state) => ({
            toasts: [...state.toasts, { ...toast, id }]
          }))
          
          // Auto-remove toast after duration
          if (toast.duration !== -1) {
            setTimeout(() => {
              get().removeToast(id)
            }, toast.duration || 5000)
          }
        },
        removeToast: (id) =>
          set((state) => ({
            toasts: state.toasts.filter((toast) => toast.id !== id)
          })),
        clearToasts: () => set({ toasts: [] }),
        
        // Modal management
        modals: {},
        openModal: (modalId) =>
          set((state) => ({
            modals: { ...state.modals, [modalId]: true }
          })),
        closeModal: (modalId) =>
          set((state) => ({
            modals: { ...state.modals, [modalId]: false }
          })),
        
        // Form states
        formSubmitting: {},
        setFormSubmitting: (formId, submitting) =>
          set((state) => ({
            formSubmitting: { ...state.formSubmitting, [formId]: submitting }
          }))
      }),
      {
        name: 'lms-ui-state',
        partialize: (state) => ({
          theme: state.theme,
          sidebarOpen: state.sidebarOpen
        })
      }
    ),
    { name: 'lms-ui-store' }
  )
)