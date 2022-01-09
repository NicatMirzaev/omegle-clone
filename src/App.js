import { useEffect, useRef } from "react";

function App() {
  const myVideo = useRef();

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
      myVideo.current.srcObject = stream;
      myVideo.current.play();
    })
    .catch(error => {
      console.log(error);
    })

  }, [])

  return (
    <div className="container">
      <div className="leftSection">
        <div className="my-video">
          <video ref={myVideo} />
        </div>
        <div className="buttons">
          <button className="btnNext">Next</button>
          <button className="btnStop">Stop</button>
        </div>
      </div>
      <div className="rightSection">
        <div className="my-video">
          test
        </div>
      </div>
    </div>
  );
}

export default App;
