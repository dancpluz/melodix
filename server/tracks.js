/* 
  Object Track:
    'id': n,
    'title': filename.slice(0,-4),
    'artist': 
    'bitrate': info.streams[0].bit_rate,
    'duration': info.streams[0].duration,
    'path': `./tracks/${filename}`

    tracks/Veigh/Perdoa por Tudo Vida.mp3
{
  streams: [
    {
      index: 0,
      codec_name: 'mp3',
      codec_long_name: 'MP3 (MPEG audio layer 3)',
      codec_type: 'audio',
      codec_time_base: '1/48000',
      codec_tag_string: '[0][0][0][0]',
      codec_tag: '0x0000',
      sample_fmt: 'fltp',
      sample_rate: '48000',
      channels: 2,
      channel_layout: 'stereo',
      bits_per_sample: 0,
      r_frame_rate: '0/0',
      avg_frame_rate: '0/0',
      time_base: '1/14112000',
      start_pts: 324870,
      start_time: '0.023021',
      duration_ts: 2260742400,
      duration: '160.200000',
      bit_rate: '160000',
      disposition: [Object],
      tags: [Object]
    }
  ]

  
*/

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

  await Promise.all(
    chunkPaths.map(async (chunkPath) => {
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
    })
  );

  console.log('Chunks carregados!')
  return chunks;
}

export default artists;