import { Server as SocketIOServer } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import type { Socket as NetSocket } from 'net';
import type { NextApiRequest } from 'next';
import type { NextApiResponse } from 'next';

interface SocketServer extends HTTPServer {
  io?: SocketIOServer | null;
}

interface SocketWithIO extends NetSocket {
  server: SocketServer;
}

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketWithIO;
}

// Global variable to store the Socket.IO server instance
let io: SocketIOServer | null = null;

export const initSocketServer = (req: NextApiRequest, res: NextApiResponseWithSocket) => {
  if (!res.socket.server.io) {
    console.log('Initializing Socket.IO server...');
    
    // Create a new Socket.IO server instance
    const socketIO = new SocketIOServer(res.socket.server as any, {
      path: '/api/socketio',
      addTrailingSlash: false,
    });
    
    // Configure Socket.IO server
    socketIO.on('connection', (socket) => {
      console.log(`Socket connected: ${socket.id}`);
      
      // Handle room subscriptions
      socket.on('subscribe', (rooms: string | string[]) => {
        if (typeof rooms === 'string') {
          socket.join(rooms);
          console.log(`Socket ${socket.id} joined room: ${rooms}`);
        } else if (Array.isArray(rooms)) {
          rooms.forEach(room => {
            socket.join(room);
            console.log(`Socket ${socket.id} joined room: ${room}`);
          });
        }
      });
      
      // Handle room unsubscriptions
      socket.on('unsubscribe', (rooms: string | string[]) => {
        if (typeof rooms === 'string') {
          socket.leave(rooms);
          console.log(`Socket ${socket.id} left room: ${rooms}`);
        } else if (Array.isArray(rooms)) {
          rooms.forEach(room => {
            socket.leave(room);
            console.log(`Socket ${socket.id} left room: ${room}`);
          });
        }
      });
      
      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
      });
    });
    
    // Store the Socket.IO server instance
    res.socket.server.io = socketIO;
    io = socketIO;
  }
  
  return res.socket.server.io;
};

// Function to get the Socket.IO server instance
export const getSocketServer = () => io;

// Function to emit an event to a specific room
export const emitToRoom = (room: string, event: string, data: any) => {
  if (io) {
    io.to(room).emit(event, data);
    return true;
  }
  return false;
};

// Function to emit an event to all connected clients
export const emitToAll = (event: string, data: any) => {
  if (io) {
    io.emit(event, data);
    return true;
  }
  return false;
};
