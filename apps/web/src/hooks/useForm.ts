import { useFormStore } from '@/store/form.store';

export const useForm = () => {
  const newRoomName = useFormStore((state) => state.newRoomName);
  const newMessage = useFormStore((state) => state.newMessage);
  const joinRoomId = useFormStore((state) => state.joinRoomId);
  
  const setNewRoomName = useFormStore((state) => state.setNewRoomName);
  const setNewMessage = useFormStore((state) => state.setNewMessage);
  const setJoinRoomId = useFormStore((state) => state.setJoinRoomId);
  
  const resetNewRoomName = useFormStore((state) => state.resetNewRoomName);
  const resetNewMessage = useFormStore((state) => state.resetNewMessage);
  const resetJoinRoomId = useFormStore((state) => state.resetJoinRoomId);
  const resetAllForms = useFormStore((state) => state.resetAllForms);

  return {
    newRoomName,
    newMessage,
    joinRoomId,
    setNewRoomName,
    setNewMessage,
    setJoinRoomId,
    resetNewRoomName,
    resetNewMessage,
    resetJoinRoomId,
    resetAllForms,
  };
}; 