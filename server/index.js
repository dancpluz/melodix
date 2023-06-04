import express from "express";
import http from "http";
import { Server as IOServer } from "socket.io";
import queue from './queue.js';
import { createReadStream } from "fs";
import net from 'net';
import { createDiffieHellmanGroup } from "crypto";

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

io.on("connection", (socket) => {

  var chunks = [];

  socket.on('updateTrackList', () => {
    // Atualizar lista
    console.log('Lista Atualizada')
    }
  )

  socket.on("sendSong",() => {
    const path = "./tracks/2. VEIGH - LUXO NO MORRO.mp3";

    chunks = [];

    const stream = createReadStream(path,{ highWaterMark: 546000 });

    stream.on("data",(chunk) => {
      chunks.push(chunk);
    });

    stream.on("end", () => {     
      console.log("Loaded Chunks")
      socket.emit("chunksLoaded")
    });

  });

  socket.on("sendChunk", () => {
    socket.emit('receiveChunk',chunks[0])
    console.log(`Sent chunk, chunks left ${chunks.length}`)
    chunks.shift();
  })

})

function calculateChunkSize(chunkDuration) {
  const sampleRate = 44100; // Assuming 44.1 kHz stereo audio
  const bytesPerSample = 2; // Assuming 16-bit audio
  const channels = 2; // Stereo

  const chunkSize = Math.ceil(
    (chunkDuration * sampleRate * bytesPerSample * channels) / 1000
  );

  return chunkSize;
}

