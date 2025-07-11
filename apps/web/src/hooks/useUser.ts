import { useUserStore } from '@/store/user.store';

export const useUser = () => {
  const user = useUserStore((state) => state.user);
  const loading = useUserStore((state) => state.loading);
  const error = useUserStore((state) => state.error);
  const fetchUser = useUserStore((state) => state.fetchUser);
  const clearUser = useUserStore((state) => state.clearUser);
  const setError = useUserStore((state) => state.setError);
  const clearError = useUserStore((state) => state.clearError);

  return {
    user,
    loading,
    error,
    fetchUser,
    clearUser,
    setError,
    clearError,
  };
}; 