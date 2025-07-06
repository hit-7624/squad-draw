import { Request, Response, NextFunction } from 'express';
import { NODE_ENV } from '@repo/config';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '@repo/config';
import { prisma } from '@repo/db';
import '../types/api';

export const signup = async (req: Request, res: Response, next: NextFunction):Promise<void> => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
         res.status(400).json({ message: "Email, password, and name are required" });
         return;
    }

    const user = await prisma.user.create({ data: { email, password, name } });
    res.status(201).json({ user });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction):Promise<void> => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.password !== password) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const token = jwt.sign({
      id: user.id,
      name: user.name,
      email: user.email,
    }, JWT_SECRET);

    res.cookie('auth-token', token, {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.status(200).json({ token });
  } catch (error) {
    next(error);
  }
}; 