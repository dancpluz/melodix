import fs from "fs/promises";
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

      filenames.map(async (filename,n) => {
        try {
          let path = `${dir}/${this.name}/${filename}`;
          const info = await ffprobe(path);
          let newTrack = new Track();
          newTrack.id = n;
          newTrack.title = filename.slice(0,-4);
          newTrack.artist = this.name;
          newTrack.bitrate = info.streams[0].bit_rate;
          newTrack.duration = info.streams[0].duration;
          newTrack.path = path;

          console.log(newTrack);
          this.tracks.push(newTrack)
        } catch (e) {
          console.log('Erro lendo músicas:',e)
        }
          // ffprobe(`${dir}/${this.name}/${filename}`,{ path: ffprobeStatic.path }, (err,info) => {
          //   if (err) {
          //     console.log(err);
          //   } else {
          //     let newTrack = new Track();
          //     newTrack.id = n;
          //     newTrack.title = filename.slice(0,-4);
          //     newTrack.artist = this.name;
          //     newTrack.bitrate = info.streams[0].bit_rate;
          //     newTrack.duration = info.streams[0].duration;

          //     this.tracks.push(newTrack)
          //   }
          // })
        }
      );
    } catch (err) {
      console.log('Erro carregando tracks:',err)
    }
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
}
