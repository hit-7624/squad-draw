import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import axios from 'axios';
import { User } from '../components/dashboard/dashboard.types';

const API_URL = process.env.NEXT_PUBLIC_API_SERVER_URL || "http://localhost:3001";

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
          
          const response = await axios.get(`${API_URL}/api/auth/me`, {
            withCredentials: true,
          });
          
          if (response.status === 200) {
            set({ 
              user: response.data, 
              loading: false,
              error: null 
            });
          }
        } catch (err: any) {
          const errorMessage = err.response?.data?.message || "Failed to load user data";
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