import { z } from 'zod';

// Sanitization helpers
const sanitizeString = (str: string) => str.trim().replace(/\s+/g, ' ');
const sanitizeEmail = (email: string) => email.trim().toLowerCase();

// Base validation schemas with sanitization
const NameSchema = z.string()
  .min(1, { message: "Name is required" })
  .max(50, { message: "Name must be less than 50 characters" })
  .regex(/^[a-zA-Z\s'-]+$/, { message: "Name can only contain letters, spaces, hyphens, and apostrophes" })
  .transform(sanitizeString);

const EmailSchema = z.string()
  .min(1, { message: "Email is required" })
  .email({ message: "Invalid email address" })
  .max(320, { message: "Email must be less than 320 characters" })
  .transform(sanitizeEmail);

const PasswordSchema = z.string()
  .min(8, { message: "Password must be at least 8 characters long" })
  .max(128, { message: "Password must be less than 128 characters" })
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, { 
    message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character" 
  });

const RoomNameSchema = z.string()
  .min(3, { message: "Room name must be at least 3 characters" })
  .max(30, { message: "Room name must be less than 30 characters" })
  .regex(/^[a-zA-Z0-9\s-_]+$/, { message: "Room name can only contain letters, numbers, spaces, hyphens, and underscores" })
  .transform(sanitizeString);

const UserIdSchema = z.string()
  .min(1, { message: "User ID is required" })
  .regex(/^[a-zA-Z0-9-_]+$/, { message: "Invalid user ID format" });

const RoomIdSchema = z.string()
  .min(1, { message: "Room ID is required" })
  .regex(/^[a-zA-Z0-9-_]+$/, { message: "Invalid room ID format" });

// User schemas
const UserSignupSchema = z.object({
  name: NameSchema,
  email: EmailSchema,
  password: PasswordSchema,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

const UserLoginSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1, { message: "Password is required" })
});

// Room schemas
const CreateRoomSchema = z.object({
  name: RoomNameSchema
});

const JoinRoomSchema = z.object({
  roomId: RoomIdSchema
});

const LeaveRoomSchema = z.object({
  roomId: RoomIdSchema
});

const DeleteRoomSchema = z.object({
  roomId: RoomIdSchema
});

// Member management schemas
const KickMemberSchema = z.object({
  roomId: RoomIdSchema,
  userId: UserIdSchema
});

const PromoteMemberSchema = z.object({
  roomId: RoomIdSchema,
  userId: UserIdSchema
});

const DemoteMemberSchema = z.object({
  roomId: RoomIdSchema,
  userId: UserIdSchema
});

const GetRoomDataSchema = z.object({
  roomId: RoomIdSchema
});

// Message and Shape schemas
const MessageContentSchema = z.string()
  .min(1, { message: "Message content is required" })
  .max(1000, { message: "Message must be less than 1000 characters" })
  .transform(sanitizeString);

const ShapeDataSchema = z.object({
  type: z.enum(['rectangle', 'circle', 'line', 'text'], { message: "Invalid shape type" }),
  x: z.number().min(0).max(10000),
  y: z.number().min(0).max(10000),
  width: z.number().min(1).max(5000).optional(),
  height: z.number().min(1).max(5000).optional(),
  radius: z.number().min(1).max(2500).optional(),
  text: z.string().max(500).transform(sanitizeString).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, { message: "Invalid color format" }).optional()
});

// Export types
export type UserSignup = z.infer<typeof UserSignupSchema>;
export type UserLogin = z.infer<typeof UserLoginSchema>;
export type CreateRoom = z.infer<typeof CreateRoomSchema>;
export type JoinRoom = z.infer<typeof JoinRoomSchema>;
export type LeaveRoom = z.infer<typeof LeaveRoomSchema>;
export type DeleteRoom = z.infer<typeof DeleteRoomSchema>;
export type KickMember = z.infer<typeof KickMemberSchema>;
export type PromoteMember = z.infer<typeof PromoteMemberSchema>;
export type DemoteMember = z.infer<typeof DemoteMemberSchema>;
export type GetRoomData = z.infer<typeof GetRoomDataSchema>;
export type MessageContent = z.infer<typeof MessageContentSchema>;
export type ShapeData = z.infer<typeof ShapeDataSchema>;

// Export schemas
export { 
  UserSignupSchema, 
  UserLoginSchema, 
  CreateRoomSchema,
  JoinRoomSchema,
  LeaveRoomSchema,
  DeleteRoomSchema,
  KickMemberSchema,
  PromoteMemberSchema,
  DemoteMemberSchema,
  GetRoomDataSchema,
  MessageContentSchema,
  ShapeDataSchema,
  NameSchema,
  EmailSchema,
  PasswordSchema,
  RoomNameSchema,
  UserIdSchema,
  RoomIdSchema
};