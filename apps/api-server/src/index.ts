import express , {Request, Response}from 'express';
import { API_SERVER_PORT } from '@repo/config';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '@repo/config';
import {prisma}  from '@repo/db';
const app = express();

app.use(express.json());

app.post("/signup", async (req:Request , res: Response ) => {
  const {email, password, name} = req.body;
  const user = await prisma.user.create({data: {email, password, name}});
  res.json({user});
});

app.post("/login", async (req:Request , res: Response ) => {
  const {email, password} = req.body;
  const user = await prisma.user.findUnique({where: {email}});
  if(!user) {

   res.status(401).json({message: "Invalid credentials"});
    return;
  }
    
  if(user.password !== password) {
    res.status(401).json({message: "Invalid credentials"});
    return;
  }
  const token = jwt.sign({id: user.id}, JWT_SECRET);
  res.json({token});
});

// app.use('/api/v1/auth', authRouter);

const port = Number(API_SERVER_PORT);
app.listen(port, () => {
  console.log(`API Server is running on port ${port}`);
});