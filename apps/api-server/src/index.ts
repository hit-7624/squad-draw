import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import { API_SERVER_PORT } from '@repo/config';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '@repo/config';
import { prisma } from '@repo/db';
import { authMiddleware } from './middlewares/auth.middleware';

const app = express();

app.use(express.json());
app.use(cookieParser());

app.post("/signup", async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  const user = await prisma.user.create({ data: { email, password, name } });
  res.json({ user });
});

app.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  if (user.password !== password) {
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
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000
  });

  res.json({ token });
});

app.get("/joined-rooms", authMiddleware, async (req: Request, res: Response) => {
  try {
    const rooms = await prisma.roomMember.findMany({
      where: { userId: req.user?.id },
      include: { room: true }
    });
    res.json({ rooms: rooms.map(rm => rm.room) });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch joined rooms" });
  }
});

const port = Number(API_SERVER_PORT);
app.listen(port, () => {
  console.log(`API Server is running on port ${port}`);
});