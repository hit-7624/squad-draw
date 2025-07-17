import { useFormStore } from "@/store/form.store";

export const useForm = () => {
  const newRoomName = useFormStore((state) => state.newRoomName);
  const joinRoomId = useFormStore((state) => state.joinRoomId);

  const setNewRoomName = useFormStore((state) => state.setNewRoomName);
  const setJoinRoomId = useFormStore((state) => state.setJoinRoomId);

  const resetNewRoomName = useFormStore((state) => state.resetNewRoomName);
  const resetJoinRoomId = useFormStore((state) => state.resetJoinRoomId);
  const resetAllForms = useFormStore((state) => state.resetAllForms);

  return {
    newRoomName,
    joinRoomId,
    setNewRoomName,
    setJoinRoomId,
    resetNewRoomName,
    resetJoinRoomId,
    resetAllForms,
  };
};
