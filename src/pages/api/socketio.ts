import { NextApiRequest } from "next";
import { NextApiResponseWithSocket, initSocket } from "@/lib/socket";

export default function handler(req: NextApiRequest, res: NextApiResponseWithSocket) {
  if (!res.socket.server.io) {
    console.log("Initializing Socket.io server...");
    const io = initSocket(res.socket.server);
    res.socket.server.io = io;
  }
  res.end();
}
