import React, { useState, useEffect } from 'react';
import ReactPlayer from 'react-player';
import './App.css'; 

function App() {
  const [videoFiles, setVideoFiles] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [playing, setPlaying] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const playerRef = React.createRef();

  useEffect(() => {
    const fetchVideoFiles = async () => {
      try {
        const response = await fetch('http://localhost:3010/detection');
        const data = await response.json();
        setVideoFiles(data);
      } catch (error) {
        console.error('Error fetching video files:', error);
      }
    };

    fetchVideoFiles();
  }, []);

  const playVideo = (videoName) => {
    setSelectedVideo(videoName);
    setPlaying(true);
  };

  const togglePlay = () => {
    setPlaying(!playing);
  };

  const handleRewind = () => {
    playerRef.current.seekTo(playerRef.current.getCurrentTime() - 0.4);
  };

  const handleFastForward = () => {
    playerRef.current.seekTo(playerRef.current.getCurrentTime() + 0.4);
  };

  const handleSpeedChange = (rate) => {
    setPlaybackRate(rate);
  };

  return (
    <div className="container">
      <div className="video-files">
        <h2 >CDAS</h2>
        <ul>
          {videoFiles.map((video, index) => (
            <li key={index}>
              <button onClick={() => playVideo(video)}>{video}</button>
            </li>
          ))}
        </ul>
      </div>
      <div className="video-player">
        <h2>Video Player</h2>
        {selectedVideo && (
          <ReactPlayer
            ref={playerRef}
            url={`http://localhost:3010/detection/${selectedVideo}`}
            controls={true}
            playing={playing}
            playbackRate={playbackRate}
            width='100%'
          />
        )}
        <div className="controls">
          <button onClick={togglePlay}>{playing ? 'Pause' : 'Play'}</button>
          <button onClick={handleRewind}>Rewind </button>
          <button onClick={handleFastForward}>Fast Forward </button>
          <button onClick={() => handleSpeedChange(0.5)}>0.5x</button>
          <button onClick={() => handleSpeedChange(1)}>1x</button>
          <button onClick={() => handleSpeedChange(1.5)}>1.5x</button>
          <button onClick={() => handleSpeedChange(2)}>2x</button>
        </div>
      </div>
    </div>
  );
}

export default App;
