import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

let socket = null;

function Loading() {
  return (
    <svg
      className="spinner"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        fill="#FFFFFF"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

function App() {
  const myVideo = useRef();
  const remoteVideo = useRef()
  const [started, setStarted] = useState(null);
  const [peerId, setPeerId] = useState(null);
  const [remotePeerId, setRemotePeerId] = useState(null);
  const [permission, setPermission] = useState(false);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
      myVideo.current.srcObject = stream;
      myVideo.current.play();

      setPermission(true);
      socket = io();
      socket.on("new-user", ({ peer_id, remote_peer_id }) => {
        setStarted(true);
        setPeerId(peer_id);
        setRemotePeerId(remote_peer_id);
      })
      socket.on("peer-found", ({ id }) => {
        setRemotePeerId(id);
      })
    })
    .catch(error => {
      console.log(error);
      setPermission(false);
    })

    return () => socket.disconnect(); //cleanup

  }, [])

  const onClickStart = () => {
    if(!permission) return;

    if(!started) {
      socket.emit("new-user");
    }
  }

  return (
    <div className="container">
      <div className="leftSection">
        <div className="video">
          <video ref={myVideo} />
          {!started && <span style={{textAlign: "center", color: "white"}}>To get started, please allow camera and microphone access. Then click to start button.</span>}
        </div>
        <div className="buttons">
          <button onClick={onClickStart} className="btnNext">{!started ? "Start" : "Next"}</button>
          <button disabled={started} className="btnStop">Stop</button>
        </div>
      </div>
      <div className="rightSection">
        <div className="video">
          <video ref={remoteVideo} />
          {started && remotePeerId === null ? <Loading/> : null}
        </div>
      </div>
    </div>
  );
}

export default App;
