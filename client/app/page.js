'use client'
import styled from 'styled-components';
import { io } from "socket.io-client";
import { useEffect,useRef,useState } from 'react';

const URL = "http://localhost:3001";
const socket = io(URL);
window.AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext = new AudioContext();

export default function Home() {
  const [trackList,setTrackList] = useState([]);
  const [connectionList,setConnectionList] = useState([]);
  const [currentTrack,setCurrentTrack] = useState(null);
  const [songPlaying,setSongPlaying] = useState(false);
  const [receivedChunks,setReceivedChunks] = useState([]);
  const [currentChunk,setCurrentChunk] = useState(0);
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

    socket.on("receiveChunk", async (songStream) => {
      const audioBuffer = await decodeAudio(songStream);
      setReceivedChunks(oldArray => [...oldArray,audioBuffer]);
      playCurrentSong()
    });

    socket.on("receiveConnections",(list) => {
      setConnectionList(list);
    })

    return () => {
      socket.off("songLoaded");
      socket.off("receiveChunk");
    };
  },[]);

  function playSample(audioBuffer) {
    const sampleSource = audioContext.createBufferSource();
    sampleSource.buffer = audioBuffer;
    sampleSource.connect(audioContext.destination);
    sampleSource.start();

    // setTimeout(() => {
    //   sampleSource.buffer = receivedChunks[0];
    //   sampleSource.connect(audioContext.destination);
    //   sampleSource.start();
    //   setReceivedChunks(oldArray => oldArray.slice(1));
    // }, receivedChunks[0].duration);
  }

  async function selectSong() {
    if (currentTrack) {
      console.log(`Requisitando música: ${currentTrack.title}`)
      socket.emit("loadSong",currentTrack.path)
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

  useEffect(() => {
    selectSong();
  },[currentTrack]);

  // for debug
  // useEffect(() => {
    

  //   console.log(connectionList)
  // },[connectionList]);

  useEffect(() => {
    fetchTrackList();
  },[]);

  useEffect(() => {
    let interval;
    if (songPlaying) {
      interval = setInterval(() => {
        if (chunkRef.current < chunkMaxRef.current) {
          const currentChunk = chunkRef.current
          console.log(`Requisitando chunk ${currentChunk + 1}`);
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

  function sendTracksRequest() {
    socket.emit("sendTracks");

    return new Promise((resolve) => {
      socket.once("receiveTracks",(tracks) => {
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

  // useEffect(() => {
  //   let interval;
  //   if (songPlaying) {
  //     interval = setInterval(() => {
  //       playSample(receivedChunks[0]);
  //       setReceivedChunks(oldArray => oldArray.slice(1));
  //     }, time * 1000);
  //   }

  //   return () => {
  //     clearInterval(interval);
  //   };
  // },[receivedChunks]);

  const Background = styled.div`
    margin: 0;
    font-family: 'DM Sans', sans-serif;
    color: white;
    background-color: black; 
  `;

  const Container = styled.div`
    display: flex;
  `;

  const MainDiv = styled.div`
    flex-grow: 1;
    background: linear-gradient(0deg, rgba(224,66,130,1) 0%, rgba(118,50,83,1) 30%, rgba(60,41,58,1) 65%, rgba(35,37,47,1) 100%);
    border-radius: 20px;
    margin: 15px 0 15px 15px;
    height: 85vh;
    overflow: auto;
  `;

  const BottomDiv = styled.div`
    width: 100vw;
    height: 15vh;
    background: black;
  `;

  const Logo = styled.h1`
    text-align: center;
    font-size: 50px;
    -webkit-text-stroke-width: 3px;
    -webkit-text-stroke-color: white;
    font-weight: 700;
    margin: 30px 30px 0;
    letter-spacing: 8px;
    cursor: default;
    user-select: none;
  `;

  const ArtistDiv = styled.div`
    margin: 0 90px;
  `;

  const ArtistTitle = styled.div`
    display: flex;
    align-items: center;
    cursor: default;
    h2 {
      margin: 30px 0;
      font-size: 40px;
      flex-grow: 1;
    }
    p {
      font-size: 20px;
    }
  `;

  const TracksDiv = styled.div`
    display: flex;
    flex-flow: column nowrap;
    padding: 0;
    margin-bottom: 0;
    font-size: 20px;
    cursor: pointer;

    div {
      display: flex;
      flex-flow: row nowrap;
      font-size: 20px;
      margin: 4px;
      background: #00000090;
      border-radius: 15px;
      padding: 10px;
      align-items: center;
      &:hover {
      background: #00000060;
      
      }
      p { // Number
        width: 80px;
        text-align: center;
        font-size: 30px;
        margin: 0 12px;
      }
      h1 { // Song Title
        font-size: 30px;
        flex-grow: 1;
      }
      h2 { // Duration
        font-size: 30px;
        margin: 0 20px;
      }
    }
  `;

  const SideDiv = styled.div`
    height: 85vh;
    width: 15%;
    background: #1A1A1A;
    border-radius: 20px;
    margin: 15px;
    overflow: auto;
    ul {
      margin: 0;
      font-size: 16px;
      
    }
    li {
      margin: 4px;
    }
  `;

  const ConnectedTitle = styled.div`
    display: flex;
    align-items: center;
    h2 {
      font-size: 24px;
      margin: 20px 0 20px 20px;
    }
    div {
      justify-content: center;
      align-items: center;
      border-radius: 100%;
      text-align: center;
      display: flex;
      margin: 0 20px;
      background: white;
      p {
        font-size: 20px;
        color: black;
      }
    }
  `;

  const YourConnection = styled.li`
    font-weight: 700;
    text-decoration: underline;
  `;


  return (
    <Background>
      <Container>
        <MainDiv>
          <Logo>MELODIX</Logo>
          {
            //JSON.stringify(trackList)
          }
          {trackList.map((artist) => {
            return (
              <ArtistDiv key={artist.name}>
                <ArtistTitle>
                  <h2>{artist.name}</h2>
                  <p>{artist.tracks.length > 0 ? `${artist.tracks.length} músicas encontradas` : ''}</p>
                </ArtistTitle>
                <TracksDiv>
                  {artist.tracks.length === 0 ? "Nenhuma música encontrada..." : artist.tracks.map((track, n) => {
                    return (
                      <div key={track.title} onClick={() => setCurrentTrack(track)}>
                        <p>{n + 1}.</p>
                        <h1>{track.title}</h1>
                        <h2>{`${Math.floor(track.duration / 60)}:${String(Math.floor(track.duration % 60)).padStart(2,'0')}`}</h2>
                      </div>
                    )
                  })}
                </TracksDiv>
              </ArtistDiv>)
          })}
        </MainDiv>
        <SideDiv>
          <ConnectedTitle>
            <h2>Usuários conectados:</h2>
            <div>
              <p>{connectionList.length}</p>
            </div>
          </ConnectedTitle>
            <ul>
              {connectionList.map((connection) => {
                return socket.id == connection ? <YourConnection key={connection}>{connection}</YourConnection> : <li key={connection}>{connection}</li>
              })}
            </ul>
        </SideDiv>
      </Container>
      <BottomDiv>
        {songPlaying ? <button onClick={() => setSongPlaying(!songPlaying)}>Pause</button> : <button onClick={() => setSongPlaying(!songPlaying)}>Play</button>}
      </BottomDiv>
    </Background>
  )
}