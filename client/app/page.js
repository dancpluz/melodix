'use client'
import styled from 'styled-components';
import { io } from "socket.io-client";
import { useEffect, useRef, useState } from 'react';

const URL = "http://localhost:3001";
const socket = io(URL);

export default function Home() {
  const [trackList,setTrackList] = useState([]);
  const [songPlaying, setSongPlaying] = useState(true);
  const [text, setText] = useState('vazio')
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

  const audioContext = new AudioContext();

  socket.on("receiveChunk", (chunk) => {
    if (chunk.byteLength == 0) {
      socket.emit('sendChunk');
    } else {
    console.log(chunk)
    decodeAudio(chunk).then((response) => {
      setReceivedChunks(prevChunks => [...prevChunks,response]);
    });
    console.log(receivedChunks);
    }
  });

  async function decodeAudio(chunk) {
    const audioBuffer = await audioContext.decodeAudioData(chunk);
    return audioBuffer;
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
