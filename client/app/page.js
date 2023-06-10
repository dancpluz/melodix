'use client'
import styled from 'styled-components';
import { io } from "socket.io-client";
import { useEffect, useRef, useState } from 'react';

const URL = "http://localhost:3001";
const socket = io(URL);
var audioContext = new AudioContext();


export default function Home() {
  const [trackList,setTrackList] = useState([]);
  const [songPlaying, setSongPlaying] = useState(true);
  const [receivedChunks,setReceivedChunks] = useState([])
  const [currentChunk, setCurrentChunk] = useState(0)

  socket.on("connect", () => {
    console.log(`Conectado com ${socket.id}`);
    socket.emit('updateTrackList');
    socket.emit('sendSong');
    }
  )

  socket.on("chunksLoaded",() => {
    setSongPlaying(true);
    console.log('loaded')
  })

  useEffect(() => {
    if (songPlaying) {
      const interval = setInterval(() => {
        socket.emit('sendChunk');
        console.log('Requesting Chunk')
      },10000);
    }
    return () => { clearInterval(interval) };
  },[]);


  socket.on("receiveChunk", async (chunk) => {
    console.log(chunk);
    audioContext.resume();
    const audioBuf = await decodeAudio(chunk);
    console.log(audioBuf);
  });


  async function decodeAudio(chunk) {
    return new Promise((resolve,reject) => {
      audioContext.decodeAudioData(chunk,(audioBuffer) => {
        resolve(audioBuffer);
      },(error) => {
        reject(error);
      });
    });
  }

  

  async function createSoundSource(audioData) {
    await Promise.all(
      audioData.map(async (chunk) => {
        const soundBuffer = await audioContext.decodeAudioData(chunk);
        const soundSource = audioContext.createBufferSource();
        soundSource.buffer = soundBuffer;
        soundSource.connect(audioContext.destination);
        soundSource.start(0);
      })
    );
  }

  function playBuffer(audioBuffer, time) {
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start(time);
  }

  return (
    <div>
      <h1>VeighRadio</h1>
      <ul>
        {trackList.map((track) => (
          <li key={track.id} onClick={() => selectSong(track.id)}>{track.title}</li>
        ))}
      </ul>
      <button onClick={() => playBuffer(receivedChunks[0],0)}>Play</button>
    </div>
  )
}
