export { useUser } from './useUser';
export { useRoom } from './useRoom';
export { useNotification } from './useNotification';
export { useForm } from './useForm'; 

// purpose of using hooks to use the store is to make code redable and if we don't use this then we will hv
// have to use syntax like this : const user = useUserStore((state) => state.user); to extract only user from the store
// and by adding this we can use the user by using the hook like this : const { user } = useUser();