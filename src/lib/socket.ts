import { Server as SocketIOServer } from "socket.io";

// Declare the global io property
declare global {
  // eslint-disable-next-line no-var
  var io: SocketIOServer | null;
}

// Function to get the Socket.io instance
export const getIO = () => {
  // In the browser, return null
  if (typeof window !== "undefined") {
    return null;
  }

  // In Node.js, return the global io instance
  return global.io || null;
};

// Function to emit an event to a room
export function emitToRoom(room: string, event: string, data: any) {
  const io = getIO();
  if (!io) {
    console.error("Socket.io not initialized");
    return false;
  }

  try {
    io.to(room).emit(event, data);
    console.log(`Emitted ${event} to room ${room}`);
    return true;
  } catch (error) {
    console.error(`Error emitting ${event} to room ${room}:`, error);
    return false;
  }
}

// Function to emit an event to all clients
export function emitToAll(event: string, data: any) {
  const io = getIO();
  if (!io) {
    console.error("Socket.io not initialized");
    return false;
  }

  try {
    io.emit(event, data);
    console.log(`Emitted ${event} to all clients`);
    return true;
  } catch (error) {
    console.error(`Error emitting ${event} to all clients:`, error);
    return false;
  }
}
