import { z } from 'zod';

const sanitizeString = (str: string) => str.trim().replace(/\s+/g, ' ');
const sanitizeEmail = (email: string) => email.trim().toLowerCase();

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

const MessageSchema = z.object({
  message: z.string()
    .min(1, { message: "Message cannot be empty" })
    .max(1000, { message: "Message must be less than 1000 characters" })
    .transform(sanitizeString)
});

const FillStyleSchema = z.enum(['hachure', 'cross-hatch', 'solid', 'zigzag']);
const StrokeStyleSchema = z.enum(['solid', 'dashed', 'dotted']);
const ShapeTypeSchema = z.enum(['RECTANGLE', 'DIAMOND', 'ELLIPSE', 'LINE', 'ARROW', 'FREEDRAW', 'TEXT', 'IMAGE']);

// Simplified schema matching current database model
const SimpleShapeSchema = z.object({
  type: ShapeTypeSchema,
  dataFromRoughJs: z.record(z.any()) // RoughJS drawable object as JSON
});

// RoughJS Drawable schema - stores complete drawing instructions
const DrawableSchema = z.object({
  shape: z.string(),           // Shape type from RoughJS
  options: z.record(z.any()),  // Options used to generate the shape
  sets: z.array(z.any())       // Drawing instruction sets (the core path data)
}).passthrough(); // Allow additional RoughJS properties

const BaseShapeSchema = z.object({
  id: z.string(),
  type: ShapeTypeSchema,
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  
  // RoughJS drawable for consistent rendering across Canvas and SVG
  drawable: DrawableSchema,
  
  // Styling properties (for UI controls and as fallback)
  stroke: z.string().default("#000000"),
  strokeWidth: z.number().default(1),
  fill: z.string().default("transparent"),
  fillStyle: FillStyleSchema.default("hachure"),
  strokeStyle: StrokeStyleSchema.default("solid"),
  roughness: z.number().default(1),
  bowing: z.number().default(1),
  seed: z.number().int().min(0).max(2147483647).default(0),
  opacity: z.number().min(0).max(1).default(1)
});

const TextElementDataSchema = z.object({
  text: z.string(),
  fontSize: z.number().default(16),
  fontFamily: z.string().default("Arial"),
  textAlign: z.enum(['left', 'center', 'right']).default('left'),
  verticalAlign: z.enum(['top', 'middle', 'bottom']).default('top'),
  autoResize: z.boolean().default(true),
  lineHeight: z.number().default(1.2)
});

const LineElementDataSchema = z.object({
  points: z.array(z.tuple([z.number(), z.number()])),
  startArrowhead: z.string().nullable().default(null),
  endArrowhead: z.string().nullable().default(null)
});

const ImageElementDataSchema = z.object({
  fileId: z.string().nullable().default(null),
  status: z.enum(['pending', 'saved', 'error']).default('pending'),
  scale: z.tuple([z.number(), z.number()]).default([1, 1])
});

const FreeDrawElementDataSchema = z.object({
  points: z.array(z.tuple([z.number(), z.number()])),
  pressures: z.array(z.number()).default([]),
  simulatePressure: z.boolean().default(false)
});

const ShapeSchema = z.discriminatedUnion('type', [
  BaseShapeSchema.extend({
    type: z.literal('TEXT'),
    elementData: TextElementDataSchema
  }),
  BaseShapeSchema.extend({
    type: z.enum(['LINE', 'ARROW']),
    elementData: LineElementDataSchema
  }),
  BaseShapeSchema.extend({
    type: z.literal('IMAGE'),
    elementData: ImageElementDataSchema
  }),
  BaseShapeSchema.extend({
    type: z.literal('FREEDRAW'),
    elementData: FreeDrawElementDataSchema
  }),
  BaseShapeSchema.extend({
    type: z.enum(['RECTANGLE', 'DIAMOND', 'ELLIPSE']),
    elementData: z.record(z.any()).default({})
  })
]);

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

export {
  NameSchema,
  EmailSchema,
  PasswordSchema,
  RoomNameSchema,
  UserIdSchema,
  RoomIdSchema,
  MessageSchema,
  SimpleShapeSchema,
  ShapeSchema,
  ShapeTypeSchema,
  UserSignupSchema,
  UserLoginSchema,
  DrawableSchema,
  FillStyleSchema,
  StrokeStyleSchema,
  BaseShapeSchema,
  TextElementDataSchema,
  LineElementDataSchema,
  ImageElementDataSchema,
  FreeDrawElementDataSchema,
}

export type UserSignup = z.infer<typeof UserSignupSchema>;
export type UserLogin = z.infer<typeof UserLoginSchema>;
export type SimpleShape = z.infer<typeof SimpleShapeSchema>;
export type Drawable = z.infer<typeof DrawableSchema>;
export type BaseShape = z.infer<typeof BaseShapeSchema>;
export type TextElementData = z.infer<typeof TextElementDataSchema>;
export type LineElementData = z.infer<typeof LineElementDataSchema>;
export type ImageElementData = z.infer<typeof ImageElementDataSchema>;
export type FreeDrawElementData = z.infer<typeof FreeDrawElementDataSchema>;
export type Shape = z.infer<typeof ShapeSchema>;
export type ShapeType = z.infer<typeof ShapeTypeSchema>;
