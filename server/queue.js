import { readdir } from 'fs/promises';
import { extname } from 'path';
import ffprobe from 'ffprobe';
import ffprobeStatic from "ffprobe-static";

ffprobe.path = ffprobeStatic.path;

class Queue {
  constructor() {
    this.clients = new Map();
    this.track = [];
    this.tracks = [];
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
                    'duration': info.streams[0].duration,
                    'path': `./tracks/${filename}` });
                }
              }
            );
          })
      )
    );
  };
}

const queue = new Queue();
export default queue;