import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import '../types/api';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const token = req.cookies['auth-token'];
        if (!token) {
            res.status(401).json({ message: "Unauthorized: No auth token found" });
            return;
        }
        
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string; name: string; email: string; };
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: "Unauthorized: Invalid token" });
        return;
    }
};