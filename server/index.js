import express from "express";
import http from "http";
import { Server as IOServer } from "socket.io";

const PORT = 3001;
const app = express();
const server = http.createServer(app);
const io = new IOServer(server);

server.listen(PORT);