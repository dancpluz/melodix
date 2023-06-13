import fs from "fs/promises";
import { existsSync, mkdirSync } from "fs";
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import { extname } from "path";
import { ffprobe } from "@dropb/ffprobe";
import ffprobeStatic from "ffprobe-static";

ffmpeg.setFfmpegPath(ffmpegPath.path);
ffprobe.path = ffprobeStatic.path;

export class Artist {
  constructor(name) {
    this.name = name;
    this.tracks = [];
  }

  async loadTracks(dir) {
    try {
      let filenames = await fs.readdir(`${dir}/${this.name}`);
      filenames = filenames.filter(
        (filename) => extname(filename) === '.mp3'
      )

      await Promise.all(filenames.map(async (filename,n) => {
        try {
          const path = `${dir}/${this.name}/${filename}`;
          const info = await ffprobe(path);
          const newTrack = new Track();
          newTrack.id = n;
          newTrack.title = filename.slice(0,-4);
          newTrack.artist = this.name;
          newTrack.bitrate = info.streams[0].bit_rate;
          newTrack.duration = info.streams[0].duration;
          newTrack.path = path;

          this.tracks.push(newTrack);
        } catch (e) {
          console.log('Erro lendo músicas:',e);
          }
        }
      ));
    } catch (err) {
      console.log('Erro carregando tracks:',err)
    }
    this.tracks.sort((a, b) => {
      return a.id - b.id;
    })
  }

  async loadTracksChunks() {
    console.log(`Carregando música(s) do ${this.name}...`)
    this.tracks.forEach(async (track,n) => {
      console.log(`${n + 1}. Carregando chunk(s) da música ${track.title}:`)
      await track.loadChunks()
    });
  }
}

export class Track {
  constructor() {
    this.id = null;
    this.title = '';
    this.artist = '';
    this.bitrate = null;
    this.duration = null;
    this.path = '';
  }

  async loadChunks() {
    const outputPath = this.path.slice(0,-4);
    const chunkDuration = 30; // 30 segundos de musica

    if (!existsSync(outputPath)) {
      mkdirSync(outputPath);
    }

    const numChunks = Math.ceil(parseInt(this.duration) / chunkDuration);
    
    for (let i = 0; i < numChunks; i++) {
      const startTime = i * chunkDuration;
      const chunkFilePath = `${outputPath}/${i + 1}-chunk.mp3`;

      if (existsSync(chunkFilePath)) {
        console.log(`Chunk ${i + 1} já existe`);
        continue;
      }

      try {
        await new Promise((resolve,reject) => {
          ffmpeg(this.path)
            .setStartTime(startTime)
            .setDuration(chunkDuration)
            .output(chunkFilePath)
            .on('end',resolve)
            .on('error',(err) => reject(err))
            .run();
        });
        console.log(`[${this.path}] Chunk ${i + 1} salvo com sucesso.`);
      } catch (err) {
        console.error(`Erro cortando chunk ${i + 1}:`,err);
      }
    }
  }
}
