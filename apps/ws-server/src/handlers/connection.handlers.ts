import { prisma } from "@repo/db";
import { Socket } from "socket.io";

export const joinRoomHandler = async (socket: Socket, data: { roomId: string }) => {
    if(!socket.data.user) {
        socket.emit('custom-error', { 
            code: 401,
            type: 'UNAUTHORIZED', 
            message: 'User not authenticated' 
        });
        return;
    }

    try {
        const room = await prisma.room.findUnique({
            where: {
                id: data.roomId,
            },
        });

        if(!room) {
            socket.emit('custom-error', { 
                code: 404,
                type: 'ROOM_NOT_FOUND', 
                message: 'Room does not exist' 
            });
            return;
        }

        const isMember = await prisma.roomMember.findFirst({
            where: {
                roomId: data.roomId,
                userId: socket.data.user.id,
            },
        });

        if(!isMember) {
            console.log('You are not a member of this room');
            socket.emit('custom-error', { 
                code: 403,  
                type: 'FORBIDDEN', 
                message: 'You are not a member of this room' 
            }); 
            return;
        }

        socket.join(data.roomId);
        socket.data.currentRoom = data.roomId;
        
        socket.emit('room-joined', {
            code: 200,
            type: 'SUCCESS',
            roomId: data.roomId
        });

        socket.to(data.roomId).emit('user-joined-room', {
            code: 200,
            type: 'USER_JOINED_ROOM',
            roomId: data.roomId,
            userId: socket.data.user.id
        });
    } catch (error) {
        console.error('Error in joinRoomHandler:', error);
        socket.emit('custom-error', {
            code: 500,
            type: 'INTERNAL_ERROR',
            message: 'Failed to join room'
        });
    }
}

export const leaveRoomHandler = async (socket: Socket, data: { roomId: string }) => {
    if (!socket.data.user) {
        socket.emit('custom-error', {
            code: 401,
            type: 'UNAUTHORIZED',
            message: 'User not authenticated',
        });
        return;
    }

    try {
        const room = await prisma.room.findUnique({
            where: { id: data.roomId },
        });

        if (!room) {
            socket.emit('custom-error', {
                code: 404,
                type: 'ROOM_NOT_FOUND',
                message: 'Room does not exist',
            });
            return;
        }

        if (!socket.rooms.has(data.roomId)) {
            socket.emit('custom-error', {
                code: 400,
                type: 'NOT_IN_ROOM',
                message: 'You are not in this room',
            });
            return;
        }

        socket.leave(data.roomId);
        socket.data.currentRoom = null;
        
        // Emit success event to the sender
        socket.emit('room-left', {
            code: 200,
            type: 'SUCCESS',
            roomId: data.roomId
        });

        // Notify other room members
        socket.to(data.roomId).emit('user-left-room', {
            code: 200,
            type: 'USER_LEFT_ROOM',
            roomId: data.roomId,
            userId: socket.data.user.id
        });
    } catch (error) {
        console.error('Error in leaveRoomHandler:', error);
        socket.emit('custom-error', {
            code: 500,
            type: 'INTERNAL_ERROR',
            message: 'Failed to leave room'
        });
    }
};

