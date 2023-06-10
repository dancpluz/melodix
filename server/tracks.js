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
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import { Artist, Track } from './classes.js';

ffmpeg.setFfmpegPath(ffmpegPath.path);

const dir = 'tracks';

const artistsName = await loadArtists(dir);
console.log(`Artista(s) descoberto(s):\n${artistsName}\n`);

const artists = [];

for (const name of artistsName) {
  let artist = new Artist(name);
  console.log(artist.name);
  await artist.loadTracks(dir);
  artists.push(artist);
}

console.log(artists)
console.log(artists[0].tracks)

async function loadArtists(dir) {
  try {
    return fs.readdir(dir)
  } catch (err) {
    console.error('Erro analisando pastas:',err)
  }
}



  // this.tracks = await Promise.all(
  //   filenames.map(
  //     (filename,n) =>
  //       new Promise((resolve,reject) => {
  //         ffprobe(
  //           `./tracks/${filename}`,
  //           { path: ffprobeStatic.path },
  //           function (err,info) {
  //             if (err) {
  //               reject(err);
  //             } else {
  //               resolve({
  //                 'id': n,
  //                 'title': filename.slice(0,-4),
  //                 'bitrate': info.streams[0].bit_rate,
  //                 'duration': info.streams[0].duration,
  //                 'path': `./tracks/${filename}`
  //               });
  //             }
  //           }
  //         );
  //       })
  //   )
  // );
  // }

// class Artist {
//   constructor() {
//     this.tracks = [];
//   }

  

//   async loadTracks(dir) {
//     let filenames = await readdir(dir);
//     filenames = filenames.filter(
//       (filename) => extname(filename) === '.mp3'
//     );

//     this.tracks = await Promise.all(
//       filenames.map(
//         (filename,n) =>
//           new Promise((resolve,reject) => {
//             ffprobe(
//               `./tracks/${filename}`,
//               { path: ffprobeStatic.path },
//               function (err,info) {
//                 if (err) {
//                   reject(err);
//                 } else {
//                   resolve({
//                     'id': n,
//                     'title': filename.slice(0,-4),
//                     'bitrate': info.streams[0].bit_rate,
//                     'duration': info.streams[0].duration,
//                     'path': `./tracks/${filename}`
//                   });
//                 }
//               }
//             );
//           })
//       )
//     );
//   }

// }

// class Tracks {
//   constructor() {
//     this.tracks = [];
    
//   }



//   cutAudioIntoChunks(track) {
//   const outputDirectory = './tracks/chunks'; // Output directory for storing the chunks
//   const chunkDuration = 30; // Duration of each chunk in seconds

//   // Create the output directory if it doesn't exist
//   if (!fs.existsSync(outputDirectory)) {
//     fs.mkdirSync(outputDirectory);
//   }

//   // Use ffmpeg to split the audio file into chunks
//     ffmpeg(path)
//     .setStartTime(0)
//     .setDuration(chunkDuration)
//     .output(outputDirectory + '/chunk-%03d.mp3')
//     .on('end',() => {
//       console.log('Audio cutting complete!');
//     })
//     .on('error',(err) => {
//       console.error('Error cutting audio:',err);
//     })
//     .run();
//   }
// }

// export default Tracks;