import { z } from "zod";

const sanitizeString = (str: string) => str.trim().replace(/\s+/g, " ");
const sanitizeEmail = (email: string) => email.trim().toLowerCase();

const NameSchema = z
  .string()
  .min(1, { message: "Name is required" })
  .max(50, { message: "Name must be less than 50 characters" })
  .regex(/^[a-zA-Z\s'-]+$/, {
    message: "Name can only contain letters, spaces, hyphens, and apostrophes",
  })
  .transform(sanitizeString);

const EmailSchema = z
  .string()
  .min(1, { message: "Email is required" })
  .email({ message: "Invalid email address" })
  .max(320, { message: "Email must be less than 320 characters" })
  .transform(sanitizeEmail);

const PasswordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters long" })
  .max(128, { message: "Password must be less than 128 characters" })
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
  });

const RoomNameSchema = z
  .string()
  .min(3, { message: "Room name must be at least 3 characters" })
  .max(30, { message: "Room name must be less than 30 characters" })
  .regex(/^[a-zA-Z0-9\s-_]+$/, {
    message:
      "Room name can only contain letters, numbers, spaces, hyphens, and underscores",
  })
  .transform(sanitizeString);

const UserIdSchema = z
  .string()
  .min(1, { message: "User ID is required" })
  .regex(/^[a-zA-Z0-9-_]+$/, { message: "Invalid user ID format" });

const RoomIdSchema = z
  .string()
  .min(1, { message: "Room ID is required" })
  .regex(/^[a-zA-Z0-9-_]+$/, { message: "Invalid room ID format" });

const MessageSchema = z.object({
  message: z
    .string()
    .min(1, { message: "Message cannot be empty" })
    .max(1000, { message: "Message must be less than 1000 characters" })
    .transform(sanitizeString),
});

const ShapeTypeSchema = z.enum([
  "HAND",
  "RECTANGLE",
  "DIAMOND",
  "ELLIPSE",
  "LINE",
  "ARROW",
  "FREEDRAW",
  "TEXT",
  "IMAGE",
]);

const SimpleShapeSchema = z.object({
  type: ShapeTypeSchema,
  dataFromRoughJs: z.record(z.any()),
});

const UserSignupSchema = z.object({
  name: NameSchema,
  email: EmailSchema,
  password: PasswordSchema,
});

const resetPasswordSchema = z
  .object({
    newPassword: PasswordSchema,
    confirmPassword: PasswordSchema,
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const UserLoginSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1, { message: "Password is required" }),
});

export {
  NameSchema,
  EmailSchema,
  PasswordSchema,
  RoomNameSchema,
  UserIdSchema,
  RoomIdSchema,
  MessageSchema,
  SimpleShapeSchema,
  ShapeTypeSchema,
  UserSignupSchema,
  UserLoginSchema,
  resetPasswordSchema,
};

export type UserSignup = z.infer<typeof UserSignupSchema>;
export type UserLogin = z.infer<typeof UserLoginSchema>;
export type SimpleShape = z.infer<typeof SimpleShapeSchema>;
export type ShapeType = z.infer<typeof ShapeTypeSchema>;
