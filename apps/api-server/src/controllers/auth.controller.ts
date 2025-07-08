import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '@repo/db';
import '../types/api';
import bcrypt from 'bcrypt';
import { UserLoginSchema, UserSignupSchema } from '@repo/schemas';
import { ZodError } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

const NODE_ENV = process.env.NODE_ENV || 'development';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';
const COOKIE_EXPIRY = Number(process.env.COOKIE_EXPIRY) || 86400000;

export const signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
  
    const { email, password, name } = UserSignupSchema.parse(req.body);
    
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({ data: { email, password: hashedPassword, name } });
    res.status(201).json({ id: user.id, name: user.name, email: user.email });
  } catch (error : any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      res.status(409).json({ message: "Email already exists" });
      return;
    }
    if(error instanceof ZodError) {
      res.status(400).json({ message: error.errors[0]?.message || 'Invalid request'  });
      return;
    }
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = UserLoginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const token = jwt.sign({
      id: user.id,
      name: user.name,
      email: user.email,
    }, JWT_SECRET, { expiresIn: JWT_EXPIRY } as jwt.SignOptions);

    res.cookie('auth-token', token, {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: COOKIE_EXPIRY
    });

    res.status(200).json({ token });
  } catch (error) {
    if(error instanceof ZodError) {
      res.status(400).json({ message: error.errors[0]?.message || 'Invalid request'  });
      return;
    }
    next(error);

  }
};

export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.clearCookie('auth-token', {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: 'strict'
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

export const me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    res.status(200).json({ id: user.id, name: user.name, email: user.email });
  } catch (error) {
    
    next(error);
  }
};