import { readdir } from 'fs/promises';
import { extname } from 'path';
import ffprobe from 'ffprobe';
import ffprobeStatic from "ffprobe-static";
import Throttle from "throttle";
import { PassThrough } from "stream";
import { createReadStream } from "fs";
import { v4 as uuid } from "uuid";

ffprobe.path = ffprobeStatic.path;

class Queue {
  constructor() {
    this.tracks = [];
    this.index = 0;
    this.clients = new Map();
    this.bufferHeader = null;
  }

  current() {
    return this.tracks[this.index];
  }

  broadcast(chunk) {
    this.clients.forEach((client) => {
      client.write(chunk);
    });
  }

  addClient() {
    const id = uuid();
    const client = new PassThrough();

    this.clients.set(id,client);
    return { id,client };
  }

  removeClient(id) {
    this.clients.delete(id);
  }

  // Carrega as faixas de áudio de um diretório
  async loadTracks(dir) {
    let filenames = await readdir(dir);
    filenames = filenames.filter(
      (filename) => extname(filename) === '.mp3'
    );
    
    this.tracks = await Promise.all(
      filenames.map(
        (filename, n) =>
          new Promise((resolve,reject) => {
            ffprobe(
              `./tracks/${filename}`,
              { path: ffprobeStatic.path },
              function (err,info) {
                if (err) {
                  reject(err);
                } else {
                  resolve({
                    'id': n,
                    'title': filename.slice(0,-4),
                    'bitrate': info.streams[0].bit_rate,
                    'duration': info.streams[0].duration,
                    'path': `./tracks/${filename}` });
                }
              }
            );
          })
      )
    );
  };

  getNextTrack() {
    // Loop back to the first track
    if (this.index >= this.tracks.length - 1) {
      this.index = 0;
    }

    const track = this.tracks[this.index++];
    this.currentTrack = track;

    return track;
  }

  pause() {
    if (!this.started() || !this.playing) return;
    this.playing = false;
    console.log("Paused");
    this.throttle.removeAllListeners("end");
    this.throttle.end();
  }

  resume() {
    if (!this.started() || this.playing) return;
    console.log("Resumed");
    this.start();
  }

  select(index) {
    console.log(`Selected ${this.tracks[index].title}`);
    if (queue.started()) {
      this.bufferHeader = null;
      this.throttle.removeAllListeners("end");
      this.throttle.end();
    }
    this.currentTrack = this.tracks[index];
    this.play(true);
  }

  started() {
    return this.stream && this.throttle && this.currentTrack;
  }

  play(useNewTrack = false) {
    if (useNewTrack || !this.currentTrack) {
      console.log("Playing new track");
      this.getNextTrack();
      this.loadTrackStream();
      this.start();
    } else {
      this.resume();
    }
  }

  loadTrackStream() {
    const track = this.currentTrack;
    if (!track) return;

    console.log("Starting audio stream");
    this.stream = createReadStream(track.path);
  }

  async start() {
    const track = this.currentTrack;
    if (!track) return;

    this.playing = true;

    const chunkSize = (track.bitrate / 8) * 30;
    this.throttle = new Throttle(chunkSize);

    this.stream
      .pipe(this.throttle)
      .on("data",(chunk) => this.broadcast(chunk))
      .on("end",() => this.play(true))
      .on("error",() => this.play(true));
  }
}


const queue = new Queue();
export default queue;