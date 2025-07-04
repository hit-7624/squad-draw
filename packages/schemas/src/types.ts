import { z} from 'zod';

const UserSignupSchema = z.object({
    name: z.string().min(1,{ message: "Name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/, { message: "Password must contain at least one uppercase letter, one lowercase letter, and one number" })
});

const UserLoginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/, { message: "Password must contain at least one uppercase letter, one lowercase letter, and one number" }),
});

const CreateRoomSchema = z.object({
  roomName: z.string().min(5, { message: "Room name should be minimum 5 characters" }).max(10, { message: "Room name should be maximum 10 characters" }),
});

export type UserSignup = z.infer<typeof UserSignupSchema>;
export type UserLogin = z.infer<typeof UserLoginSchema>;
export type CreateRoom = z.infer<typeof CreateRoomSchema>;

export { UserSignupSchema, UserLoginSchema, CreateRoomSchema };