'use client'
import styled from 'styled-components';
import { io } from "socket.io-client";
import { useEffect, useState } from 'react';

const socket = io("http://localhost:3001");

export default function Home() {
  const [trackList,setTrackList] = useState([]);
  const [playingMusic, setPlayingMusic] = useState(null);

  useEffect(() => {
    socket.on("trackList",(receivedTrackList) => {
      // Processar a lista de músicas recebida
      setTrackList(receivedTrackList);
    });
  
    return () => {
      socket.disconnect();
    }
  }, [])
  
  return (
    <div>
      <h1>VeighRadio</h1>
      <ul>
        {trackList.map((track) => (
          <li key={track.id} >{track.title}</li>
        ))}
      </ul>
    </div>
  )
}
