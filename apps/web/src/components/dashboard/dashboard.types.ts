export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Room {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  isShared: boolean;
  userRole: 'ADMIN' | 'MEMBER';
}

export interface Message {
  id: string;
  message: string;
  createdAt: string;
  user: User;
  roomId: string;
  userId: string;
}

export interface Shape {
  id: string;
  type: string;
  data: any;
  createdAt: string;
  creator: User;
  roomId: string;
  creatorId: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MEMBER';
} 