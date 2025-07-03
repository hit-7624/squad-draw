import express from 'express';
import dotenv from 'dotenv';
const app = express();
dotenv.config({
  path: './.env',
});
app.use(express.json());




// app.use('/api/v1/auth', authRouter);

const port = Number(process.env.API_SERVER_PORT) || 3001;
app.listen(port, () => {
  console.log(`API Server is running on port ${port}`);
});