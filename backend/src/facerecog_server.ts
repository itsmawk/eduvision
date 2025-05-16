import express, { Request, Response } from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

const PORT = 5001;

app.use(cors());
app.get("/", (req: Request, res: Response) => {
    res.send("Face recognition server is running");
});

io.on("connection", (socket) => {
    console.log("[INFO] Client connected");

    socket.on("frame", (frame) => {
        console.log("[INFO] Frame received");
        socket.emit("faces", ["Test Face 1", "Test Face 2"]);
    });

    socket.on("disconnect", () => {
        console.log("[INFO] Client disconnected");
    });
});

server.listen(PORT, () => {
    console.log(`[INFO] Face recognition server listening on port ${PORT}`);
});
