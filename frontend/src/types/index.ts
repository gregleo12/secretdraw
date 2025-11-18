// Common type definitions for SecretDraw

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  organizerId: string;
  drawDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Participant {
  id: string;
  groupId: string;
  userId?: string;
  name: string;
  email: string;
  isCouple: boolean;
  couplePartnerId?: string;
}

export interface Drawing {
  id: string;
  groupId: string;
  drawDate: string;
  isComplete: boolean;
}

export interface Assignment {
  id: string;
  drawingId: string;
  giverId: string;
  receiverId: string;
  notificationSentAt?: string;
  viewed: boolean;
}

export interface ApiError {
  message: string;
  code: string;
  statusCode: number;
}
