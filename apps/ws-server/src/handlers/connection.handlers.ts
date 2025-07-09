import { prisma } from "@repo/db";
import { Socket } from "socket.io";

export const joinRoomHandler = async (socket: Socket, data: { roomId: string }) => {
    // Validate user authentication
    if(!socket.data.user) {
        socket.emit('custom-error', { 
            code: 401,
            type: 'UNAUTHORIZED', 
            message: 'User not authenticated' 
        });
        return;
    }

    // Validate input data
    if (!data || typeof data !== 'object') {
        socket.emit('custom-error', {
            code: 400,
            type: 'INVALID_DATA',
            message: 'Invalid join room data format'
        });
        return;
    }

    // Validate roomId
    if (!data.roomId || typeof data.roomId !== 'string' || !data.roomId.trim()) {
        socket.emit('custom-error', {
            code: 400,
            type: 'INVALID_ROOM_ID',
            message: 'Room ID is required and must be a valid string'
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
        
        // Get all online users in this room
        const socketsInRoom = await socket.in(data.roomId).fetchSockets();
        const onlineUserIds = socketsInRoom
            .map(s => s.data.user?.id)
            .filter(id => id)
            .concat(socket.data.user.id); // Include current user
        
        // Remove duplicates
        const uniqueOnlineUserIds = [...new Set(onlineUserIds)];
        
        socket.emit('room-joined', {
            code: 200,
            type: 'SUCCESS',
            roomId: data.roomId,
            onlineMembers: uniqueOnlineUserIds
        });

        // Notify other room members that this user joined
        socket.to(data.roomId).emit('user-joined-room', {
            code: 200,
            type: 'USER_JOINED_ROOM',
            roomId: data.roomId,
            userId: socket.data.user.id,
            userName: socket.data.user.name
        });

        // Send updated online members list to all room members
        socket.to(data.roomId).emit('online-members-updated', {
            roomId: data.roomId,
            onlineMembers: uniqueOnlineUserIds
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
    // Validate user authentication
    if (!socket.data.user) {
        socket.emit('custom-error', {
            code: 401,
            type: 'UNAUTHORIZED',
            message: 'User not authenticated',
        });
        return;
    }

    // Validate input data
    if (!data || typeof data !== 'object') {
        socket.emit('custom-error', {
            code: 400,
            type: 'INVALID_DATA',
            message: 'Invalid leave room data format'
        });
        return;
    }

    // Validate roomId
    if (!data.roomId || typeof data.roomId !== 'string' || !data.roomId.trim()) {
        socket.emit('custom-error', {
            code: 400,
            type: 'INVALID_ROOM_ID',
            message: 'Room ID is required and must be a valid string'
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

        // Get remaining online users in this room before leaving
        const socketsInRoom = await socket.in(data.roomId).fetchSockets();
        const remainingUserIds = socketsInRoom
            .map(s => s.data.user?.id)
            .filter(id => id && id !== socket.data.user.id); // Exclude the leaving user
        
        socket.leave(data.roomId);
        socket.data.currentRoom = null;
        
        // Emit success event to the sender
        socket.emit('room-left', {
            code: 200,
            type: 'SUCCESS',
            roomId: data.roomId
        });

        // Notify other room members that this user left
        socket.to(data.roomId).emit('user-left-room', {
            code: 200,
            type: 'USER_LEFT_ROOM',
            roomId: data.roomId,
            userId: socket.data.user.id,
            userName: socket.data.user.name
        });

        // Send updated online members list to remaining room members
        socket.to(data.roomId).emit('online-members-updated', {
            roomId: data.roomId,
            onlineMembers: remainingUserIds
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

export const getOnlineMembersHandler = async (socket: Socket, data: { roomId: string }) => {
    // Validate user authentication
    if (!socket.data.user) {
        socket.emit('custom-error', {
            code: 401,
            type: 'UNAUTHORIZED',
            message: 'User not authenticated',
        });
        return;
    }

    // Validate input data
    if (!data || typeof data !== 'object') {
        socket.emit('custom-error', {
            code: 400,
            type: 'INVALID_DATA',
            message: 'Invalid get online members data format'
        });
        return;
    }

    // Validate roomId
    if (!data.roomId || typeof data.roomId !== 'string' || !data.roomId.trim()) {
        socket.emit('custom-error', {
            code: 400,
            type: 'INVALID_ROOM_ID',
            message: 'Room ID is required and must be a valid string'
        });
        return;
    }

    try {
        // Check if user is a member of this room
        const isMember = await prisma.roomMember.findFirst({
            where: {
                roomId: data.roomId,
                userId: socket.data.user.id,
            },
        });

        if (!isMember) {
            socket.emit('custom-error', {
                code: 403,
                type: 'FORBIDDEN',
                message: 'You are not a member of this room',
            });
            return;
        }

        // Get all online users in this room
        const socketsInRoom = await socket.in(data.roomId).fetchSockets();
        const onlineUserIds = socketsInRoom
            .map(s => s.data.user?.id)
            .filter(id => id);

        // Include current user if they're in the room
        if (socket.rooms.has(data.roomId)) {
            onlineUserIds.push(socket.data.user.id);
        }

        // Remove duplicates
        const uniqueOnlineUserIds = [...new Set(onlineUserIds)];

        socket.emit('online-members-list', {
            code: 200,
            type: 'SUCCESS',
            roomId: data.roomId,
            onlineMembers: uniqueOnlineUserIds
        });
    } catch (error) {
        console.error('Error in getOnlineMembersHandler:', error);
        socket.emit('custom-error', {
            code: 500,
            type: 'INTERNAL_ERROR',
            message: 'Failed to get online members'
        });
    }
};

