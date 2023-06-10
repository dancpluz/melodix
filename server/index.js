import express from "express";
import http from "http";
import { Server as IOServer } from "socket.io";
import fs from "fs";
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from "@ffmpeg-installer/ffmpeg";


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

async function cutAudioIntoChunks(track) {
  const outputDirectory = './tracks/chunks'; // Output directory for storing the chunks
  const chunkDuration = 30000; // Duration of each chunk in milliseconds (30 seconds)

  // Create the output directory if it doesn't exist
  if (!fs.existsSync(outputDirectory)) {
    fs.mkdirSync(outputDirectory);
  }

  const numChunks = Math.ceil(track.duration / chunkDuration);
  console.log(numChunks)

  for (let i = 0; i < numChunks; i++) {
    const startTime = i * chunkDuration;
    const chunkFilePath = `${outputDirectory}/chunk-${i + 1}.mp3`;

    console.log(startTime);

    await new Promise((resolve,reject) => {
      ffmpeg(track.path)
        .setStartTime(startTime / 1000) // Convert milliseconds to seconds
        .setDuration(chunkDuration / 10000) // 30 second
        .output(chunkFilePath)
        .on('end',() => {
          console.log(`Chunk ${i + 1} saved successfully.`);
          resolve();
        })
        .on('error',(err) => {
          console.error(`Error cutting chunk ${i + 1}:`,err);
          reject(err);
        })
        .run();
    });
  }

  console.log('Audio cutting complete!');
}

cutAudioIntoChunks({ 'path': "./tracks/test.mp3",'duration': 204000 })
  .catch((error) => {
    console.error('Error cutting audio:',error);
  });

io.on("connection", (socket) => {
  console.log('test')


  socket.on('updateTrackList', () => {
    // Atualizar lista
    console.log('Lista Atualizada')
    }
  )

  socket.on("sendSong",() => {
    const stream = fs.createReadStream("./tracks/test.mp3");

    stream.on("data",(chunk) => {
      
    });

    stream.on("end",() => {
      
    });
  });

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

function calculateChunkSize(chunkDuration) {
  const sampleRate = 44100; // Assuming 44.1 kHz stereo audio
  const bytesPerSample = 2; // Assuming 16-bit audio
  const channels = 2; // Stereo

  const chunkSize = Math.ceil(
    (chunkDuration * sampleRate * bytesPerSample * channels) / 1000
  );

  return chunkSize;
}

