import express , {Request, Response}from 'express';
import { API_SERVER_PORT, JWT_SECRET } from '@repo/config';
import {prisma}  from '@repo/db';
const app = express();

app.use(express.json());

console.log('JWT Secret from config:', JWT_SECRET);
app.get('/', async (req:Request , res: Response ) => {
  console.log('Received a request at /');


  const users = await prisma.user.findMany();
  console.log('Fetched users:', users);
  res.json({ allUsers : users });

});
// app.use('/api/v1/auth', authRouter);

const port = Number(API_SERVER_PORT);
app.listen(port, () => {
  console.log(`API Server is running on port ${port}`);
});