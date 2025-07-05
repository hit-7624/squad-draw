import { Socket } from "socket.io";
import { prisma, Shape, Message } from "@repo/db";




export const newShapeHandler = async (socket: Socket, newShape: Shape) => {
    const { type, data, roomId, creatorId } = newShape;
    const createdShape = await prisma.shape.create({
        data: {
            type: type,
            data: data as any,
            roomId: roomId,
            creatorId: creatorId,
        },
    });
    if(socket.data.currentRoom !== roomId) {
        socket.emit('custom-error', {
            code: 400,
            type: 'NOT_IN_ROOM',
            message: 'You are not in this room! dont try to send shapes to other rooms , dont do these crazy things',
        });
        return;
    }
    socket.to(roomId).emit('new-shape-added', createdShape);
}

export const newMessageHandler = async (socket: Socket, newMessage: Message) => {
    const { message, roomId, userId } = newMessage;
    const createdMessage = await prisma.message.create({
        data: {
            message: message,
            roomId: roomId,
            userId: userId,
        },
    });
    if(socket.data.currentRoom !== roomId) {
        socket.emit('custom-error', {
            code: 400,
            type: 'NOT_IN_ROOM',
            message: 'You are not in this room! dont try to send messages to other rooms , dont do these crazy things',
        });
        return;
    }
    socket.to(roomId).emit('new-message-added', createdMessage);
}