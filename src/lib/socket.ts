import { Server as HTTPServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { NextApiResponse } from "next";

export type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: HTTPServer & {
      io?: SocketIOServer;
    };
  };
};

let io: SocketIOServer | null = null;

export function getIO(): SocketIOServer | null {
  return io;
}

export function setIO(server: SocketIOServer): void {
  io = server;
}

export function initSocket(httpServer: HTTPServer): SocketIOServer {
  if (io) return io;
  io = new SocketIOServer(httpServer, {
    path: "/api/socketio",
    addTrailingSlash: false,
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
  return io;
}
