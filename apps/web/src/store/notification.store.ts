import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface NotificationState {
  error: string | null;
  success: string | null;
}

interface NotificationActions {
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
  clearMessages: () => void;
  clearError: () => void;
  clearSuccess: () => void;
}

interface NotificationStore extends NotificationState, NotificationActions {}

export const useNotificationStore = create<NotificationStore>()(
  devtools(
    (set) => ({
      error: null,
      success: null,

      showError: (message: string) => {
        set({ error: message, success: null });
        setTimeout(() => {
          set({ error: null });
        }, 5000);
      },

      showSuccess: (message: string) => {
        set({ success: message, error: null });
        setTimeout(() => {
          set({ success: null });
        }, 3000);
      },

      clearMessages: () => {
        set({ error: null, success: null });
      },

      clearError: () => {
        set({ error: null });
      },

      clearSuccess: () => {
        set({ success: null });
      },
    }),
    {
      name: 'notification-store',
    }
  )
); 