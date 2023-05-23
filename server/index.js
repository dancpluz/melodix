import express from "express";
import http from "http";
import { Server as IOServer } from "socket.io";
import queue from './queue.js';

const PORT = 3001;
const app = express();
const server = http.createServer(app);
const io = new IOServer(server,{
  cors: {
    origin: "http://localhost:3000",
  },
});

app.get('/',(req,res) => {
  res.send('Servidor em Execução');
});

server.listen(PORT,() => {
  // Evento "connection" é disparado quando um cliente se conecta ao servidor Socket.IO
  io.on("connection",(socket) => {
  console.log("Novo cliente conectado");

  // Enviar a lista de músicas para o cliente
    queue.loadTracks('tracks');
    console.log('Lista atualizada');
    socket.emit("trackList",queue.tracks);
  });

  

  console.log(`Ouvindo porta ${PORT}`);
});