import ws from 'ws';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

const port = Number(process.env.WS_SERVER_PORT) || 3002;
const wss = new ws.Server({ port });
console.log(`WebSocket Server is running on port ${port}`);

wss.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('message', (message) => {
    console.log(`Received message: ${message}`);
    // Echo the message back to the client
    socket.send(`Echo: ${message}`);
  });

  socket.on('close', () => {
    console.log('Client disconnected');
  });
});