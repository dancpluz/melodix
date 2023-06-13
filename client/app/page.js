'use client'
import styled from 'styled-components';
import { io } from "socket.io-client";
import { useEffect,useRef,useState } from 'react';

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
      h1 {
        text-decoration: underline;
      }
      
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
        font-size: 24px;
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
    display: relative;
    h2 {
      font-size: 30px;
      margin: 20px 30px 20px;
    }
    p {
      top: 20px;
      right: 40px;
      position: absolute;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      text-align: center;
      line-height: 40px;
      background: white;
      font-size: 20px;
      color: black;
      font-weight: 700;
    }
  `;

const YourConnection = styled.li`
    font-weight: 700;
    text-decoration: underline;
  `;

const BottomDiv = styled.div`
    width: 100vw;
    height: 15vh;
    background: black;
    display: flex;
  `;

const PlayButton = styled.button`
  position: absolute;
  left: 0;
  right: 0;
  margin: 0 auto;
  border-radius: 50%;
  font-size: 28px;
  line-height: 80px;
  text-align: center;
  width: 80px;
  height: 80px;
  color: white;
  background: black;
  border: white solid 2px;
  cursor: pointer;
  &:hover {
    background: #1A1A1A;
    font-size: 30px;
  }
`;

const CurrentTrackDiv = styled.div`
  margin: 0 40px;
  h1 { // Title
    margin: 10px 0;
    font-size: 30px;
  }
  h2 { // Artist
    margin: 10px 0;
    font-size: 24px;
  }
  p { // time
    margin: 0;
    font-size: 16px;
  }
`;

const URL = "http://localhost:3001";
const socket = io(URL);
window.AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext = new AudioContext();

export default function Home() {
  const [trackList,setTrackList] = useState([]);
  const [connectionList,setConnectionList] = useState([]);
  const [currentTrackInfo,setCurrentTrackInfo] = useState(null);
  const [songPlaying,setSongPlaying] = useState(false);
  const [songStarted,setSongStarted] = useState(false);
  const [receivedChunks,setReceivedChunks] = useState([]);
  const [requestChunks, setRequestChunks] = useState(false)
  const chunkMaxRef = useRef(0);
  const tracksRef = useRef(null);
  const chunkRef = useRef(0);

  useEffect(() => {
    socket.on("songLoaded",(chunkMax) => {
      chunkMaxRef.current = chunkMax;
      chunkRef.current = 0;
      setRequestChunks(true);
    });

    socket.on("receiveChunk", async (songStream) => {
      const audioBuffer = await decodeAudio(songStream);
      setReceivedChunks(oldArray => [...oldArray,audioBuffer]);
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
  }

  function playSong(trackInfo) {
    audioContext.close().then(() => {
      audioContext = new AudioContext;
    })
    requestCurrentSong(trackInfo);
    setSongStarted(false);
    setSongPlaying(true);
  }

  function requestCurrentSong(trackInfo) {
    if (trackInfo == currentTrackInfo && receivedChunks.length != 0) {
      console.log("já existe")
    } else {
      setReceivedChunks([])
      setCurrentTrackInfo(trackInfo);
      console.log(`Requisitando música: ${trackInfo.title}`)
      socket.emit("loadSong",trackInfo.path)
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
    let interval;
    if (!songStarted && receivedChunks.length != 0) {
      console.log("Tocando primeiro chunk:",receivedChunks[0])
      playSample(receivedChunks[0]);
      setReceivedChunks(oldArray => oldArray.slice(1));
      setSongStarted(true);
    }
    else if (receivedChunks.length != 0) {
      interval = setTimeout(() => {
        console.log("Tocando chunk");
        playSample(receivedChunks[0]);
        setReceivedChunks(oldArray => oldArray.slice(1));
      },30000)
    } else {
      console.log("teste")
    } 
    return () => {
      clearTimeout(interval);
    }
  }, [receivedChunks])

  function pauseSong() {
    console.log("Música pausada")
    audioContext.suspend();
    setSongPlaying(false);
  }

  function resumeSong() {
    console.log("Música resumida")
    audioContext.resume()
    setSongPlaying(true);
  }
  
  useEffect(() => {
    fetchTrackList();
  },[]);

  useEffect(() => {
    let interval;
    interval = setInterval(() => {
      if (chunkRef.current < chunkMaxRef.current) {
        const currentChunk = chunkRef.current
        console.log(`Requisitando chunk ${currentChunk + 1}`);
        socket.emit('sendChunk',currentChunk);
        chunkRef.current = currentChunk + 1;
      } else {
        console.log('Todos os chunks recebidos')
        setRequestChunks(false);
        clearInterval(interval);
      }
    },2000);

    return () => {
      clearInterval(interval);
    };
  },[requestChunks]);

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

  return (
    <Background>
      <Container>
        <MainDiv>
          <Logo>MELODIX</Logo>
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
                      <div key={track.title} onClick={() => playSong(track)}>
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
        <CurrentTrackDiv>
          <h1>{!currentTrackInfo ?  "" : currentTrackInfo.title}</h1>
          <h2>{!currentTrackInfo ? "" : currentTrackInfo.artist}</h2>
          <p>{!currentTrackInfo ? "" : `${Math.floor(currentTrackInfo.duration / 60)}:${String(Math.floor(currentTrackInfo.duration % 60)).padStart(2,'0')}`}</p>
        </CurrentTrackDiv>
        {songPlaying ? <PlayButton onClick={() => pauseSong()}>⏸</PlayButton> : <PlayButton onClick={() => resumeSong()}>▶</PlayButton>}
      </BottomDiv>
    </Background>
  )
}