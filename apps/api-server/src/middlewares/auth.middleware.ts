import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/config";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies['auth-token'];
    if(!token) {
        res.status(401).json({message: "Unauthorized"});
        return;
    }
    const decoded = jwt.verify(token, JWT_SECRET) as {  id: string; name: string; email: string; };
    req.user = decoded;
    next();
}