import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { authClient } from '@/lib/auth-client';
import { User } from '@/components/dashboard/dashboard.types';

interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface UserActions {
  fetchUser: () => Promise<void>;
  clearUser: () => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

interface UserStore extends UserState, UserActions {}

export const useUserStore = create<UserStore>()(
  devtools(
    (set, get) => ({
      user: null,
      loading: false,
      error: null,

      fetchUser: async () => {
        try {
          set({ loading: true, error: null });
          
          const session = await authClient.getSession();
          
          if (session?.data?.user) {
            const user: User = {
              id: session.data.user.id,
              name: session.data.user.name,
              email: session.data.user.email,
            };
            
            set({ 
              user, 
              loading: false,
              error: null 
            });
          } else {
            set({ 
              user: null, 
              loading: false,
              error: null 
            });
          }
        } catch (err: any) {
          const errorMessage = err.message || "Failed to load user data";
          set({ 
            error: errorMessage, 
            loading: false,
            user: null 
          });
          throw err;
        }
      },

      clearUser: () => {
        set({ 
          user: null, 
          loading: false, 
          error: null 
        });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'user-store',
    }
  )
); 