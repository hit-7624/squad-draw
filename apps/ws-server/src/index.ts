import ws from 'ws';
import { JWT_SECRET } from '@repo/config';

const port = Number(process.env.WS_SERVER_PORT) || 3002;
const wss = new ws.Server({ port });
console.log(`WebSocket Server is running on port ${port}`);

wss.on('connection', (socket) => {
  console.log('New client connected');

  console.log('JWT Secret from config:', JWT_SECRET);

  socket.on('message', (message) => {
    console.log(`Received message: ${message}`);
    socket.send(`Echo: ${message}`);
  });

  socket.on('close', () => {
    console.log('Client disconnected');
  });
});