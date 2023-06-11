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

let songStreams = []

server.listen(PORT,() => {
  console.log(`Escutando porta ${PORT}`);
});

io.on("connection", (socket) => {
  socket.on("sendTracks", () => {
    console.log("Enviando informações de músicas carregadas");
    socket.emit("receiveTracks", JSON.stringify(artists));
  })

  socket.on("loadSong", async (path) => {
    const dir = path.slice(0,-4);
    console.log(`Carregando chunks de ${dir}`);
    const chunkPaths = await readFolders(dir);
    songStreams = await createChunkStreams(dir, chunkPaths);
    socket.emit("receiveChunks")
  })

  // socket.on ()
  // socket.on("sendSong",() => {
  //   const stream = fs.createReadStream("./tracks/test.mp3");

  //   stream.on("data",(chunk) => {
      
  //   });

  //   stream.on("end",() => {
      
  //   });
  // });

  // socket.on("sendSong",() => {
  //   chunks = [];

  //   const stream = createReadStream('./tracks/test.mp3');

  //   stream.on("data",(chunk) => {
  //     chunks.push(chunk);
  //   });

  //   stream.on("end", () => {     
  //     console.log("Loaded Chunks")
  //     socket.emit("chunksLoaded")
  //   });

  // });

  // socket.on("sendChunk", () => {
  //   socket.emit('receiveChunk',chunks[0])
  //   console.log(`Sent chunk, chunks left ${chunks.length}`)
  //   chunks.shift();
  // })

})

