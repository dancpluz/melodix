
import fs from "fs/promises";
import { createReadStream } from "fs";
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import { Artist } from './classes.js';

ffmpeg.setFfmpegPath(ffmpegPath.path);

const dir = 'tracks';

const artistsName = await readFolders(dir);
console.log(`Artista(s) descoberto(s):\n${artistsName}\n`);

const artists = [];

for (const name of artistsName) {
  let artist = new Artist(name);
  await artist.loadTracks(dir);
  artists.push(artist);
}

console.log(`Artista(s) Carregado(s)!\n`)

for (const artist of artists) {
  if (artist.tracks.length == 0) {
    console.log(`Não há músicas na pasta do artista ${artist.name}`)
  } else {
    await artist.loadTracksChunks();
    console.log(`Chunks do Artista ${artist.name} carregados`);
  }
}

console.log(`Todos chunks carregados!`)

export async function readFolders(dir) {
  try {
    return fs.readdir(dir)
  } catch (err) {
    console.error('Erro analisando pastas:',err)
  }
}

export async function createChunkStreams(path,chunkPaths) {
  const chunks = [];

  for (const chunkPath of chunkPaths) {
    const streamBlocks = [];

    const stream = createReadStream(`${path}/${chunkPath}`);

    stream.on("data",(block) => {
      streamBlocks.push(block);
    });

    await new Promise((resolve) => {
      stream.on("end",() => {
        const chunk = Buffer.concat(streamBlocks);
        chunks.push(chunk);
        resolve();
      });
    });
  }

  console.log('Chunks carregados!')
  return chunks;
}

export default artists;