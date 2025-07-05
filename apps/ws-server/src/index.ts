import { Server, Socket } from 'socket.io';
import { createServer } from 'http';
import { API_SERVER_PORT, ORIGIN_URL, WS_SERVER_PORT } from '@repo/config';
import { authMiddleware } from './middlewares/auth.middleware';
import { joinRoomHandler, leaveRoomHandler } from './handlers/connection.handlers';
import { newMessageHandler, newShapeHandler } from './handlers/content.handlers';

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: { 
        origin: ORIGIN_URL,
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

io.use(authMiddleware);

io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join-room', async (data) => {
        try {
            await joinRoomHandler(socket, data);
        } catch (error) {
            console.error('Error in join-room event:', error);
            socket.emit('custom-error', {
                code: 500,
                type: 'INTERNAL_ERROR',
                message: 'Failed to join room'
            });
        }
    });

    socket.on('leave-room', async (data) => {
        try {
            await leaveRoomHandler(socket, data);
        } catch (error) {
            console.error('Error in leave-room event:', error);
            socket.emit('custom-error', {
                code: 500,
                type: 'INTERNAL_ERROR',
                message: 'Failed to leave room'
            });
        }
    });

    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });

    socket.on('disconnect', () => {

        console.log('Client disconnected:', socket.id);
    });


    socket.on('new-shape', async (data) => {
        try {
            await newShapeHandler(socket, data);
        } catch (error) {
            console.error('Error in new-shape event:', error);
            socket.emit('custom-error', {
                code: 500,
                type: 'INTERNAL_ERROR', 
                message: 'Failed to create new shape'
            });
        }
    });

    socket.on('new-message', async (data) => {
        try {
            await newMessageHandler(socket, data);
        } catch (error) {
            console.error('Error in new-message event:', error);
            socket.emit('custom-error', {
                code: 500,
                type: 'INTERNAL_ERROR', 
                message: 'Failed to create new message'
            });
        }
    });

});

io.engine.on('connection_error', (error) => {
    console.error('Connection error:', error);
});

httpServer.listen(WS_SERVER_PORT, () => {
    console.log(`WebSocket server is running on port ${WS_SERVER_PORT}`);
});


