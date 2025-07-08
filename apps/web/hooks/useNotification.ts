import { useNotificationStore } from '../store/notification.store';

export const useNotification = () => {
  const error = useNotificationStore((state) => state.error);
  const success = useNotificationStore((state) => state.success);
  const showError = useNotificationStore((state) => state.showError);
  const showSuccess = useNotificationStore((state) => state.showSuccess);
  const clearMessages = useNotificationStore((state) => state.clearMessages);
  const clearError = useNotificationStore((state) => state.clearError);
  const clearSuccess = useNotificationStore((state) => state.clearSuccess);

  return {
    error,
    success,
    showError,
    showSuccess,
    clearMessages,
    clearError,
    clearSuccess,
  };
}; 