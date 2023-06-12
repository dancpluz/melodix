'use client'
import styled from 'styled-components';
import { io } from "socket.io-client";
import { useEffect, useRef, useState } from 'react';

const URL = "http://localhost:3001";
const socket = io(URL);
//window.AudioContext = window.AudioContext || window.webkitAudioContext;
//var audioContext = new AudioContext();

export default function Home() {
  const [trackList,setTrackList] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [songPlaying,setSongPlaying] = useState(false);
  const [currentChunk, setCurrentChunk] = useState(0);
  const [receivedChunks,setReceivedChunks] = useState([]);
  const chunkMaxRef = useRef(0);
  const tracksRef = useRef(null);
  const chunkRef = useRef(0);
  
  useEffect(() => {
    console.log(`Conectado com ${socket.id}`);

    socket.on("songLoaded",(chunkMax) => {
      chunkMaxRef.current = chunkMax;
      setSongPlaying(true);
      console.log(chunkMax);
    });

    socket.on("receiveChunk",async (songStream) => {
      const audioBuffer = await decodeAudio(songStream);
      setReceivedChunks(oldArray => [...oldArray,audioBuffer]);
      playSample(audioBuffer);
    });

    return () => {
      socket.off("songLoaded");
      socket.off("receiveChunk");
    };
  },[]);

  function playSample(audioBuffer) {
    const sampleSource = audioContext.createBufferSource();
    sampleSource.buffer = audioBuffer;
    sampleSource.connect(audioContext.destination);
    sampleSource.start(0)
  }

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

  async function selectSong() {
    setCurrentSong(trackList[2].tracks[0]);
    console.log(currentSong);
    if (currentSong) {
      console.log(`Requisitando música: ${currentSong.title}`)
      socket.emit("loadSong",currentSong.path)
    } else {
      console.log("Nenhuma música escolhida")
    }
  }

  async function decodeAudio(chunk) {
    return new Promise((resolve,reject) => {
      audioContext.decodeAudioData(chunk,(audioBuffer) => {
        resolve(audioBuffer);
      },(error) => {
        reject(error);
      });
    });
  }

//temp
  useEffect(() => {
    console.log(receivedChunks);
  },[receivedChunks]);

  useEffect(() => {
    fetchTrackList();
  },[]);

  useEffect(() => {
    let interval;
    if (songPlaying) {
      interval = setInterval(() => {
        if (chunkRef.current < chunkMaxRef.current) {
          const currentChunk = chunkRef.current
          console.log(`Requisitando chunk ${currentChunk}`);
          socket.emit('sendChunk',currentChunk);
          chunkRef.current = currentChunk + 1;
        } else {
          console.log('Todos os chunks recebidos')
          clearInterval(interval);
        }
      },2000);
    }

    return () => {
      clearInterval(interval);
    };
  },[songPlaying]);

  return (
    <div>
      <h1>VeighRadio</h1>
      <p>{JSON.stringify(trackList)}</p>
      {trackList.map((artist) => {
        <h2>{artist.name}</h2>
      })}
      <ul>
        {}
      </ul>
      <button onClick={selectSong}>Play</button>
    </div>
  )
}
