import { Socket } from "socket.io";
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from "@repo/config";
import { parse } from 'cookie';

export const authMiddleware = (socket: Socket, next: (err?: Error) => void) => {
    try {
        const cookieHeader = socket.handshake.headers.cookie;
        if (!cookieHeader) {
            return next(new Error('Authentication error: No cookies found'));
        }

        const cookies = parse(cookieHeader);
        const token = cookies['auth-token'];

        if (!token) {
            return next(new Error('Authentication error: No auth token found'));
        }

        const decoded = jwt.verify(token, JWT_SECRET) as {  id: string; name: string; email: string;  };
        
        socket.data.user = decoded;
        socket.data.currentRoom = null;
        
        next();
    } catch (error) {
        return next(new Error('Authentication error: Invalid token'));
    }
};
