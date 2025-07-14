import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface FormState {
  newRoomName: string;
  newMessage: string;
  joinRoomId: string;
}

interface FormActions {
  setNewRoomName: (name: string) => void;
  setNewMessage: (message: string) => void;
  setJoinRoomId: (id: string) => void;
  resetNewRoomName: () => void;
  resetNewMessage: () => void;
  resetJoinRoomId: () => void;
  resetAllForms: () => void;
}

interface FormStore extends FormState, FormActions {}

export const useFormStore = create<FormStore>()(
  devtools(
    (set) => ({
      newRoomName: "",
      newMessage: "",
      joinRoomId: "",

      setNewRoomName: (name: string) => {
        set({ newRoomName: name });
      },

      setNewMessage: (message: string) => {
        set({ newMessage: message });
      },

      setJoinRoomId: (id: string) => {
        set({ joinRoomId: id });
      },

      resetNewRoomName: () => {
        set({ newRoomName: "" });
      },

      resetNewMessage: () => {
        set({ newMessage: "" });
      },

      resetJoinRoomId: () => {
        set({ joinRoomId: "" });
      },

      resetAllForms: () => {
        set({ newRoomName: "", newMessage: "", joinRoomId: "" });
      },
    }),
    {
      name: "form-store",
    },
  ),
);
