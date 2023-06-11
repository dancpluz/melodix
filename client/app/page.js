'use client'
import styled from 'styled-components';
import { io } from "socket.io-client";
import { useEffect, useRef, useState } from 'react';

const URL = "http://localhost:3001";
const socket = io(URL);
//var audioContext = new AudioContext();

export default function Home() {
  const [trackList,setTrackList] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [songPlaying,setSongPlaying] = useState(false);
  const [currentChunk, setCurrentChunk] = useState(0);
  const [receivedChunks,setReceivedChunks] = useState([]);
  const tracksRef = useRef(null);

  socket.on("connect", () => {
    console.log(`Conectado com ${socket.id}`);
    socket.on("receiveChunks", (chunks) => {
      
    })
    }
  )

  function sendTracksRequest() {
    socket.emit("sendTracks");

    return new Promise((resolve) => {
      socket.once("receiveTracks", (tracks) => {
        console.log(`Informações de músicas recebidas`);
        const receivedTracks = JSON.parse(tracks);
        tracksRef.current = receivedTracks;
        resolve(receivedTracks)
      })
    })
  }

  async function fetchTrackList() {
    while (!tracksRef.current) {
      await sendTracksRequest();
    }
    setTrackList(tracksRef.current);
  }

  // socket.on("receiveTracks", (tracks) => {
  //   console.log(`Informações de música recebidas`);
  //   tracksRef.current = JSON.parse(tracks);
  //   setTrackList(JSON.parse(tracks));
  // })

  async function selectSong() {
    setCurrentSong(trackList[2].tracks[0]);
    console.log(currentSong);
    if (currentSong) {
      console.log(`Requisitando música: ${currentSong.title}`)
      socket.emit("loadSong",(currentSong.path))
    } else {
      console.log("Nenhuma música escolhida")
    }

  }

  useEffect(() => {
    fetchTrackList();
  },[]);

  // useEffect(() => {
  //   if (songPlaying) {
  //     const interval = setInterval(() => {
  //       socket.emit('sendChunk');
  //       console.log('Requesting Chunk')
  //     },10000);
  //   }
  //   return () => { clearInterval(interval) };
  // },[]);


  // socket.on("receiveChunk", async (chunk) => {
  //   console.log(chunk);
  //   audioContext.resume();
  //   const audioBuf = await decodeAudio(chunk);
  //   console.log(audioBuf);
  // });


  // async function decodeAudio(chunk) {
  //   return new Promise((resolve,reject) => {
  //     audioContext.decodeAudioData(chunk,(audioBuffer) => {
  //       resolve(audioBuffer);
  //     },(error) => {
  //       reject(error);
  //     });
  //   });
  // }

  // async function createSoundSource(audioData) {
  //   await Promise.all(
  //     audioData.map(async (chunk) => {
  //       const soundBuffer = await audioContext.decodeAudioData(chunk);
  //       const soundSource = audioContext.createBufferSource();
  //       soundSource.buffer = soundBuffer;
  //       soundSource.connect(audioContext.destination);
  //       soundSource.start(0);
  //     })
  //   );
  // }

  // function playBuffer(audioBuffer, time) {
  //   const source = audioContext.createBufferSource();
  //   source.buffer = audioBuffer;
  //   source.connect(audioContext.destination);
  //   source.start(time);
  // }

  return (
    <div>
      <h1>VeighRadio</h1>
      <p>{JSON.stringify(trackList)}</p>
      <ul>
        {}
      </ul>
      <button onClick={selectSong}>Play</button>
    </div>
  )
}
