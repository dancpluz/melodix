import express from "express";
import http from "http";
import { Server as IOServer } from "socket.io";
import fs from "fs";
import artists from './tracks.js';
import { readFolders, createChunkStreams } from './tracks.js';


const PORT = 3001;
const app = express();
const server = http.createServer(app);
const io = new IOServer(server,{
  cors: {
    origin: "http://localhost:3000",
  },
});

server.listen(PORT,() => {
  console.log(`Escutando porta ${PORT}`);
});

const activeConnections = [];

io.on("connection", (socket) => {
  console.log(`Conectado com id:${socket.id}`)

  activeConnections.push(socket.id);
  console.log("Conexões ativas:", activeConnections.slice(1));

  let songStreams = []

  socket.on("disconnect",() => {
    const index = activeConnections.indexOf(socket.id);
    if (index !== -1) {
      activeConnections.splice(index,1);
      console.log(`Desconectado com id: ${socket.id}`);
      console.log("Conexões ativas:",activeConnections.slice(1));
    }
  });

  socket.on("sendTracks", () => {
    console.log("Enviando informações de músicas carregadas");
    socket.emit("receiveTracks", JSON.stringify(artists));
  })

  socket.on("loadSong", async (path) => {
    const dir = path.slice(0,-4);
    console.log(`Carregando chunks de ${dir}`);
    const chunkPaths = await readFolders(dir);
    songStreams = await createChunkStreams(dir, chunkPaths);
    socket.emit("songLoaded", songStreams.length);
  })

  socket.on("sendChunk", (index) =>{
    socket.emit("receiveChunk", songStreams[index]);
  })


})

