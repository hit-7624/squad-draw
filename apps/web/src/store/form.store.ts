import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface FormState {
  newRoomName: string;
  joinRoomId: string;
}

interface FormActions {
  setNewRoomName: (name: string) => void;
  setJoinRoomId: (id: string) => void;
  resetNewRoomName: () => void;
  resetJoinRoomId: () => void;
  resetAllForms: () => void;
}

interface FormStore extends FormState, FormActions {}

export const useFormStore = create<FormStore>()(
  devtools(
    (set) => ({
      newRoomName: "",
      joinRoomId: "",

      setNewRoomName: (name: string) => {
        set({ newRoomName: name });
      },

      setJoinRoomId: (id: string) => {
        set({ joinRoomId: id });
      },

      resetNewRoomName: () => {
        set({ newRoomName: "" });
      },

      resetJoinRoomId: () => {
        set({ joinRoomId: "" });
      },

      resetAllForms: () => {
        set({ newRoomName: "", joinRoomId: "" });
      },
    }),
    {
      name: "form-store",
    },
  ),
);
