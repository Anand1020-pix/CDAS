import React, { useState, useEffect } from 'react';
import './App.css'; // Import CSS file for styling

function App() {
  const [videoFiles, setVideoFiles] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);

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
  };

  return (
    <div className="container">
      <div className="video-files">
        <h2>CDAS</h2>
        <ul>
          {videoFiles.map((video, index) => (
            <li key={index}>
              <button onClick={() => playVideo(video)}>{video}</button>
            </li>
          ))}
        </ul>
      </div>
      <div className="video-player">
        <h2></h2>
        {selectedVideo && (
          <video controls src={`http://localhost:3010/detection/${encodeURIComponent(selectedVideo)}`} />
        )}
      </div>
    </div>
  );
}

export default App;
